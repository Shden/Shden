/*
 *	Smart house controller module.
 *	
 *	14-Nov-2010: 	- pump is controlled separately from heater allowing other heaters to work effectively.
 *			- overheating control implemented.
 *	28-NOV-2010:	- simple standby energy saving algorithm based on weekday added.
 *	10-APR-2011:	- standby temperature change from 10.0 to 8.0.
 *	26-APR-2011:	- configuration goes to .ini file.
 *	01-MAY-2011:	- turn off heater logic added to work with external heater.
 *	11-SEP-2011:	- kitchen sensor added.
 *	07-OCT-2011:	- per room heating control added.
 *	07-NOV-2011:	- night tariff & energy saving in standby mode implemented.
 *  	20-NOV-2011:	- pump is on based on in/out temperature difference.
 *	19-DEC-2011:	- mips porting: Glib dependency removed.
 *	01-JAN-2012:	- HNY!)) electric heater off algorithm improved, based on 2 parameters:
 *			  1) outgoing fluid temp and 2) extra heating from oven.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include "onewire.h"

//#define DEBUG_NO_1WIRE	// Should be DEBUG_NO_1WIRE to run without 1-wire net
#define PATH_LEN	80

/* Configuration data lives here */
struct ConfigT
{
	char		configFilePath[PATH_LEN];	/* controller.ini full path */
	char		heaterFailurePath[PATH_LEN];	/* heater failure control file path */
	struct tm	arrive;
	struct tm	dep;
	float		presenceTargetTemp;		/* Target temp when we are at home */
	float		standbyTargetTemp;		/* Target temp when nobody at home (day) */
	float		standbyTargetNightTemp;		/* Target temp when nobody at home (night) */
	float		tempDelta;			/* Histeresis */
	float 		inOutDeltaPumpOffTemp;		/* Temperature differeince (in/out) on heater when stop pump */
	
	/* The next two parameters both control how electric heater is turned off when oven is on: */
	float		fluidElectricHeaterOffTemp;	/* Outgoing fluid temperature O2 to off electic heater */
	float		ovenExtraElectricHeaterOffTemp;	/* O2 - O1 difference to off electric heater */
} configuration;

const float heaterCutOffTemp	= 95.0;			/* Heater failure temperature */

/* Tariff section */
const int nightTariffStartHour	= 0;	/* actually 23 to 7 but meanwhile they failed to */
const int nightTariffEndHour	= 8;	/* block powermeters to stop swithing to winter time :) */

#define 	ROOMS_COUNT 		5
#define		INI_BUFF_LEN		80

// Ini file headers & variables are defined here:
#define		HEATING_SECTION		"[heating]"
#define		SCHEDULE_SECTION	"[schedule]"

#define		STANDBY_VALUE		"standby"
#define		STANDBY_NIGHT_VALUE	"standby_night"
#define		PRESENCE_VALUE		"presence"
#define		TEMP_DELTA_VALUE	"tempDelta"
#define		PUMP_OFF_VALUE		"fluidPumpOffTemp"
#define		HEATER_OFF_VALUE	"fluidElectricHeaterOffTemp"
#define		HEATER_DELTA_OFF_VALUE	"ovenExtraElectricHeaterOffTemp"

#define		ARRIVE_DATE_VALUE	"arrive_date"
#define		ARRIVE_HOUR_VALUE	"arrive_hour"
#define		DEP_DATE_VALUE		"dep_date"
#define		DEP_HOUR_VALUE		"dep_hour"

typedef enum ConfigParserStatus
{
	DISORIENTED,
	HEATING,
	SCHEDULE
} ConfigParserStatus;

/* Room control descriptor */
typedef struct TRoomControlDescriptor
{
	const char*	sensorAddress;		/* Address of temperature sensor of the room */
	float		temperatureCorrection;	/* Temperature correction, 0 if no correction needed, >0 if sensor returns less that actually <0 otherwise */
	const char*	switchAddress;		/* Address of room's heating switch */
} RoomControlDescriptor;

RoomControlDescriptor roomControlDescriptors[ROOMS_COUNT];

/* Init configuration directories based on the controller path */
void setDirectories(const char* controllerPath)
{
	/* Note: the directory controller executable is deployed
	 * shall contain the subdirectory named the same as controller
	 * but having _config suffix e.g. controller_config.
	 * Configuration files are to be deployed to this subdirectory. */
	sprintf(configuration.configFilePath, "%s_config/controller.ini", controllerPath);
	sprintf(configuration.heaterFailurePath, "%s_config/HeaterFailure", controllerPath);
}

/* Room descriptors initialization */
void initRoomDescriptors()
{
	// Small children room
	roomControlDescriptors[0].sensorAddress = childrenSmallSensor;
	roomControlDescriptors[0].temperatureCorrection = 0.0;
	roomControlDescriptors[0].switchAddress = childrenSmallSwitch;

	// Guestroom (AM)
	roomControlDescriptors[1].sensorAddress = amSensor;
	roomControlDescriptors[1].temperatureCorrection = 0.0;
	roomControlDescriptors[1].switchAddress = NULL;

	// Bedroom
	roomControlDescriptors[2].sensorAddress = bedroomSensor;
	roomControlDescriptors[2].temperatureCorrection = 0.0;
	roomControlDescriptors[2].switchAddress = NULL;

	// Cabinet
	roomControlDescriptors[3].sensorAddress = cabinetSensor;
	roomControlDescriptors[3].temperatureCorrection = 0.0;
	roomControlDescriptors[3].switchAddress = NULL;

	// Kitchen
	roomControlDescriptors[4].sensorAddress = kitchenSensor;
	roomControlDescriptors[4].temperatureCorrection = 0.0;
	roomControlDescriptors[4].switchAddress = NULL;
}

void loadSettings()
{
	FILE* iniFile;
	iniFile = fopen(configuration.configFilePath, "r");

	char iniFileBuff[INI_BUFF_LEN];
	const char sectionName[INI_BUFF_LEN];
	ConfigParserStatus status = DISORIENTED;

	while (NULL != fgets(iniFileBuff, INI_BUFF_LEN, iniFile))
	{
		switch(status)
		{
		case DISORIENTED:
			if (1 == sscanf(iniFileBuff, "%s", sectionName))
			{
				if (!strcmp(sectionName, HEATING_SECTION))
				{
					status = HEATING;
				}
				else if (!strcmp(sectionName, SCHEDULE_SECTION))
				{
					status = SCHEDULE;
				}
				else
				{
					printf("Unrecognized section: [%s], skipped.\n\r", sectionName); 
					status = DISORIENTED;
				}
			}
			break;
			
		case HEATING:
		case SCHEDULE:
			{
				const char varName[INI_BUFF_LEN];
				const char varValue[INI_BUFF_LEN];
			
				if (2 == sscanf(iniFileBuff,"%s = \"%s\"", varName, varValue))
				{
					if (!strcmp(varName, STANDBY_VALUE))
					{
						sscanf(varValue, "%f", &configuration.standbyTargetTemp);
					}
					else if (!strcmp(varName, STANDBY_NIGHT_VALUE))
					{
						sscanf(varValue, "%f", &configuration.standbyTargetNightTemp);
					}
					else if (!strcmp(varName, PRESENCE_VALUE))
					{
						sscanf(varValue, "%f", &configuration.presenceTargetTemp);
					}
					else if (!strcmp(varName, TEMP_DELTA_VALUE))
					{
						sscanf(varValue, "%f", &configuration.tempDelta);
					}
					else if (!strcmp(varName, PUMP_OFF_VALUE))
					{
						sscanf(varValue, "%f", &configuration.inOutDeltaPumpOffTemp);
					}
					else if (!strcmp(varName, HEATER_OFF_VALUE))
					{
						sscanf(varValue, "%f", &configuration.fluidElectricHeaterOffTemp);
					}
					else if (!strcmp(varName, HEATER_DELTA_OFF_VALUE))
					{
						sscanf(varValue, "%f", &configuration.ovenExtraElectricHeaterOffTemp);
					}
					else if (!strcmp(varName, ARRIVE_DATE_VALUE))
					{
						// arrival date parse
						configuration.arrive.tm_sec = 
						configuration.arrive.tm_min = 0;
						sscanf(varValue, "%d.%d.%d",
							&configuration.arrive.tm_mday, 
							&configuration.arrive.tm_mon, 
							&configuration.arrive.tm_year);
						configuration.arrive.tm_year -= 1900;
						configuration.arrive.tm_mon -= 1;
						configuration.arrive.tm_hour -= 1;
					}
					else if (!strcmp(varName, ARRIVE_HOUR_VALUE))
					{
						// arrival hour
						sscanf(varValue, "%d", 
							&configuration.arrive.tm_hour);
					}
					else if (!strcmp(varName, DEP_HOUR_VALUE))
					{
						// departure hour
						sscanf(varValue, "%d", 
						&configuration.dep.tm_hour);
					}
					else if (!strcmp(varName, DEP_DATE_VALUE))
					{
						// departure date
						configuration.dep.tm_sec = 
						configuration.dep.tm_min = 0;
						sscanf(varValue, "%d.%d.%d",
							&configuration.dep.tm_mday, 
							&configuration.dep.tm_mon, 
							&configuration.dep.tm_year);
						configuration.dep.tm_year -= 1900;
						configuration.dep.tm_mon -= 1;
						configuration.dep.tm_hour -= 1;
					}
					else
					{
						printf("Unrecognized value: [%s], skipped.\n\r", varName);
					}
				}
			}
			break;
		} // switch
	} // while

	mktime(&configuration.arrive);
	mktime(&configuration.dep);

	fclose(iniFile);
}

void setHeater(int ison)
{
	return changeSwitch(heaterSwitch, ison);
}

void setPump(int ison)
{
	return changeSwitch(pumpSwitch, ison);
}

int getHeaterState()
{
	return getSwitchState(heaterSwitch);
}

int getPumpState()
{
	return getSwitchState(pumpSwitch);
}

/** Returnes combined avergage temperature to control */
float getControlTemperature()
{
	return getT(bedroomSensor);
}


/** This returns time required to heat up the house for presence mode, in hours */
float getHeatingTimeForPresence()
{
	const float heatUpSpeed = 0.8;	// speed of heating up, C/hour.
	float current = getControlTemperature();
	return (configuration.presenceTargetTemp - current) / heatUpSpeed; // hours
}

//** This will return the time when to start heating so that it will all ok when we there */
time_t getHeatingStartTime()
{	
	return mktime(&configuration.arrive) - getHeatingTimeForPresence() * 60 * 60;
}

/** Current target temperature, controlled by configuration */
float getTargetTemp()
{
	// -- Check precence time
	if (isPresence())
	{
		return configuration.presenceTargetTemp;
	}

	// -- If in standby, check day/night targets to save power
	if (isSaving())
	{
		return configuration.standbyTargetNightTemp;
	}

	return configuration.standbyTargetTemp;
}

/** Returns TRUE if presence mode or FALSE if standby mode */
int isPresence()
{
	// -- Check precence time
	time_t now = time(NULL);
	time_t start = getHeatingStartTime();
	time_t finish = mktime(&configuration.dep);

	return now >= start && now <= finish;
}

//** Return TRUE if saving (night) tariff is on or FALSE otherwise */
int isSaving()
{
	time_t now = time(NULL);
	struct tm *ti = localtime(&now);

	return ti->tm_hour >= nightTariffStartHour && ti->tm_hour < nightTariffEndHour;
}

/** Room control routine.
 *	roomDescr - descriptor of the room to control
 *	targetTemp - target temperature for the room
 */
void controlRoom(RoomControlDescriptor* roomDescr, float targetTemp)
{
	// -- Return if no room control available
	if (!roomDescr->switchAddress || !roomDescr->sensorAddress)
		return;

	float roomTemp = getT(roomDescr->sensorAddress) + roomDescr->temperatureCorrection;

	if (roomTemp > targetTemp + configuration.tempDelta)
		changeSwitch(roomDescr->switchAddress, OFF);
	else
		changeSwitch(roomDescr->switchAddress, ON);
}

/** Heater control routine.
 *	controlTemp - current control temperature (room or composite of rooms)
 *	heaterTemp - current electric heater temperature to control (ref: O1)
 *	outgoingFluidTemp - current outgoing temperature of the fluid 
 *			    (oven + electric heater, ref: O2)
 */
int controlHeater(float controlTemp, float heaterTemp, float outgoingFluidTemp)
{
	/* First check heater is OK (wasn't overheated) */
	if (heaterTemp > heaterCutOffTemp)
	{
		// -- Current date and time
		time_t now = time(NULL);

		// -- Persist failure info		
		FILE *fp;
		fp = fopen(configuration.heaterFailurePath, "w");
		if (NULL != fp)
		{
			const char* formatStr = "%s: Heater failure detected t=%4.2f.\r\n";
			fprintf(fp, formatStr, ctime(&now), heaterTemp);
			fclose(fp);
			printf(formatStr, ctime(&now), heaterTemp);
		}
		else
			printf("Cannot write heater failure status file.\n\r");

		exit(EXIT_FAIL);
	}

	if (outgoingFluidTemp > configuration.fluidElectricHeaterOffTemp &&
	    outgoingFluidTemp - heaterTemp > configuration.ovenExtraElectricHeaterOffTemp)
	{
		// Other heater has created enough temperature, no need to run electricity
		setHeater(OFF);
		return OFF;
	}
	else if (controlTemp < getTargetTemp())
	{
		setHeater(ON);
//		setPump(ON);
		return ON;
	}
	else if (controlTemp > getTargetTemp() + configuration.tempDelta)
	{
		setHeater(OFF);
		// Dont stop pump until fluid temp will go down
		// Other heat sources may still be on
		return OFF;
	}
	// return current state
	return getHeaterState();
}

int controlPump(float ingoingFluidTemp, float outgoingFluidTemp)
{
	float inOutDelta = outgoingFluidTemp - ingoingFluidTemp;

	if (/*OFF == getHeaterState() && */inOutDelta < configuration.inOutDeltaPumpOffTemp)
	{
		setPump(OFF);
		return OFF;
	}
	if (inOutDelta >= configuration.inOutDeltaPumpOffTemp)
	{
		setPump(ON);
		return ON;
	}
	return getPumpState();
}

int wasOverheated()
{
	FILE *fp;
	fp = fopen(configuration.heaterFailurePath, "r");
	if (NULL != fp)
	{
		fclose(fp);
		return 1;
	}
	return 0;
}

void getDateTimeStr(char *str, int length, time_t time)
{
	struct tm *ti = localtime(&time);

	// TODO : buffer overrun control!
	sprintf(str, "%02d/%02d/%4d %02d:%02d:%02d", ti->tm_mday, ti->tm_mon+1, ti->tm_year+1900, ti->tm_hour, ti->tm_min, ti->tm_sec);
}

int main(int argc, const char** args)
{
	// -- Set confguration.ini & others directories relative to the app location
	setDirectories(args[0]);
	
	// -- Check for previous fatal errors
	if (wasOverheated())
	{
		printf("Previous heater failure detected. Cannot run.\n\r");
		return EXIT_FAIL;
	}

	// -- Load settings from .ini file
	loadSettings();

//	debug stuff
//	printf("%s", asctime(&configuration.arrive));
//	printf("%s", asctime(&configuration.dep));
//	time_t tt = getHeatingStartTime();
//
//	printf("%s", ctime(&tt));
//	printf("%f\n", getTargetTemp());
//
//	printf("%f\n", configuration.tempDelta);
//	printf("%f\n", configuration.fluidPumpOffTemp);
//	return; 
// 	end of debug stuff

	// -- Measure current temperatures and set out the target
	float controlTemp = getControlTemperature();
	float outgoingFluidTemp = getT(outputSensor);
	float ingoingFluidTemp = getT(inputSensor);
	float electricHeaterTemp = getT(heaterSensor);
	float targetTemp = getTargetTemp();

	// -- Control heater and pump
	int heaterState = controlHeater(controlTemp, electricHeaterTemp, outgoingFluidTemp);
	int pumpState = controlPump(ingoingFluidTemp, outgoingFluidTemp);

	// -- Individual rooms control
	/* Not tested yet	
	int i;
	for (i=0; i<ROOMS_COUNT; i++)
		controlRoom(&roomControlDescriptors[i], targetTemp);
	*/
	
	// -- Dates: now and when to start heating next time by our arrival
	char nowStr[60], onStr[60];
	getDateTimeStr(nowStr, 60, time(NULL));
	getDateTimeStr(onStr, 60, getHeatingStartTime());

	printf("%s|%4.2f|%4.2f|%4.2f||%4.2f||%4.2f|%4.2f|%4.2f|%4.2f||%4.2f|%4.2f||%4.2f||%d|%d||%c|%c|%4.1f|%s|\r\n", 
		nowStr,
		electricHeaterTemp,
		ingoingFluidTemp,
		outgoingFluidTemp,
		getT(externalSensor),
		0.0,//getT(amSensor),
		getT(bedroomSensor),
		0.0,//getT(cabinetSensor),
		getT(childrenSmallSensor),
		getT(kitchenSensor),
		getT(bathRoomSensor),
		controlTemp,
		heaterState,
		pumpState,
		(isPresence() ? 'P' : 'S'),
		(isSaving() ? 'N' : 'D'),
		targetTemp,
		onStr
	);

	return EXIT_OK;
}

