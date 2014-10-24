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
 *	08-SEP-2013:	- pump differential algorithm to keep temperature the same when heating is off.
 *	13-NOV-2013:	- night tariff is back to 11pm to 7am period.
 *	24-OCT-2014:	- comfort sleet mode added, no per room control yet.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "onewire.h"

//#define DEBUG_NO_1WIRE	// Should be DEBUG_NO_1WIRE to run without 1-wire net

/* Configuration data lives here */
struct ConfigT
{
	char		configFilePath[FILENAME_MAX];		/* controller.ini full path */
	char		heaterFailurePath[FILENAME_MAX];	/* heater failure control file path */
	struct tm	arrive;
	struct tm	dep;
	float		presenceTargetTemp;			/* Target temp when we are at home */
	float		standbyTargetTemp;			/* Target temp when nobody at home (day) */
	float		standbyTargetNightTemp;			/* Target temp when nobody at home (night) */
	float		tempDelta;				/* Histeresis */
	float 		stopPumpTempDelta;			/* Temperature differeince across the house to stop pump */

	/* The next two parameters both control how electric heater is turned off when oven is on: */
	float		fluidElectricHeaterOffTemp;		/* Outgoing fluid temperature O2 to off electic heater */
	float		ovenExtraElectricHeaterOffTemp;		/* O2 - O1 difference to off electric heater */
	
	/* Comfort sleep parameters */
	int		sleepModeStartHour;			/* Sleep start */
	int 		sleepModeEndHour;			/* and end time (hours) */
	float		sleepTargetTemp;			/* Target temperature for sleep mode (for bedrooms only) */
} configuration;

const float heaterCutOffTemp		= 95.0;			/* Heater failure temperature */

/* Tariff section */
const int nightTariffStartHour		= 23;
const int nightTariffEndHour		= 7;

#define 	ROOMS_COUNT 		5
#define		INI_BUFF_LEN		80
#define		TBL			60
#define		MPH			60			// 60 minutes per hour
#define 	SPM			60			// 60 seconds per minute

// INI file headers & variables are defined here:
#define		HEATING_SECTION		"[heating]"
#define		SCHEDULE_SECTION	"[schedule]"
#define		COMFORT_SLEEP_SECTION	"[comfort_sleep]"

#define		STANDBY_VALUE		"standby"
#define		STANDBY_NIGHT_VALUE	"standby_night"
#define		PRESENCE_VALUE		"presence"
#define		TEMP_DELTA_VALUE	"tempdelta"
#define		PUMP_OFF_VALUE		"stoppumptempdelta"
#define		HEATER_OFF_VALUE	"fluidelectricheaterofftemp"
#define		HEATER_DELTA_OFF_VALUE	"ovenextraelectricheaterofftemp"

#define		ARRIVE_DATE_VALUE	"arrive_date"
#define		ARRIVE_HOUR_VALUE	"arrive_hour"
#define		DEP_DATE_VALUE		"dep_date"
#define		DEP_HOUR_VALUE		"dep_hour"

#define		SLEEP_MODE_START_HOUR	"sleep_mode_start_hour"
#define		SLEEP_MODE_END_HOUR	"sleep_mode_end_hour"
#define		SLEEP_TARGET_TEMP	"sleep_target_temp"

typedef enum ConfigParserStatus
{
	DISORIENTED,
	HEATING,
	SCHEDULE,
	COMFORT_SLEEP
} ConfigParserStatus;

/* Room control descriptor */
typedef struct TRoomControlDescriptor
{
	const char*	sensorAddress;		/* Address of temperature sensor of the room */
	float		temperatureCorrection;	/* Temperature correction, 0 if no correction needed, >0 if sensor returns less that actually <0 otherwise */
	const char*	switchAddress;		/* Address of room's heating switch */
} RoomControlDescriptor;

RoomControlDescriptor roomControlDescriptors[ROOMS_COUNT];

// -- Forward declarations
time_t getHeatingStartTime();
int checkIfNowWithinInterval(int, int, int, int);

/* Init configuration directories based on the controller path */
void setDirectories()
{
	strcpy    (configuration.configFilePath, "/home/den/Shden/shc/heating_config/controller.ini");
	strcpy (configuration.heaterFailurePath, "/home/den/Shden/shc/heating_config/HeaterFailure");
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
	char sectionName[INI_BUFF_LEN];
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
				else if (!strcmp(sectionName, COMFORT_SLEEP_SECTION))
				{
					status = COMFORT_SLEEP;
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
		case COMFORT_SLEEP:
			{
				char varName[INI_BUFF_LEN];
				char varValue[INI_BUFF_LEN];

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
						sscanf(varValue, "%f", &configuration.stopPumpTempDelta);
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
					else if (!strcmp(varName, SLEEP_MODE_START_HOUR))
					{
						// comfort sleep start hour
						sscanf(varValue, "%d", &configuration.sleepModeStartHour);
					}
					else if (!strcmp(varName, SLEEP_MODE_END_HOUR))
					{
						// comfort sleep end hour
						sscanf(varValue, "%d", &configuration.sleepModeEndHour);
					}
					else if (!strcmp(varName, SLEEP_TARGET_TEMP))
					{
						// departure hour
						sscanf(varValue, "%f", &configuration.sleepTargetTemp);
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
	return checkIfNowWithinInterval(nightTariffStartHour, 0, nightTariffEndHour, 0);
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

//** This will return the time when to start heating so that house is heated when we will be there */
time_t getHeatingStartTime()
{
	return mktime(&configuration.arrive) - getHeatingTimeForPresence() * MPH * SPM;
}

/* Helper function.
  Checks if now we are within time interval specified by its start (h:m) and end (h:m) */
int checkIfNowWithinInterval(int startHour, int startMin, int endHour, int endMin)
{
	time_t now_t = time(NULL);
        struct tm *ti = localtime(&now_t);
	
	// all 3 below in minutes
	int start = startHour * MPH + startMin;
	int end = endHour * MPH + endMin;
	int now = ti->tm_hour * MPH + ti->tm_min;
	
	if (start < end)
	{		
		// interval start is earlier than end, straightforward interval (e.g. 14 to 20)
		return (now >= start && now <= end);
	}
	else
	{
		// interval start is later than end, looped interval (e.g. 23 to 7)
		return (now >= start || now <= end);
	}
}

/** Current target temperature, controlled by configuration */
float getTargetTemp()
{
	// -- Check precence time
	if (isPresence())
	{
		/* TMP solution for comfort sleep. Once per room valves are installed, this code should be gone
		to controlRoom() function. */
		if (checkIfNowWithinInterval(configuration.sleepModeStartHour, 0, configuration.sleepModeEndHour, 0))
			return configuration.sleepTargetTemp;
		else
			return configuration.presenceTargetTemp;
	}

	// -- If in standby, check day/night targets to save power
	if (isSaving())
	{
		return configuration.standbyTargetNightTemp;
	}

	return configuration.standbyTargetTemp;
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

		setHeater(OFF);
		setPump(ON);

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

/*
 *	Pump control procedure
 *	tempVector - vector of temperatures across the house
 *	size - length of the vector
 *
 *	Pump shall be on while the vector contains devations more than configured.
 */
int controlPump(const float* tempVector, int size)
{
	float minT = tempVector[0], maxT = tempVector[0];
	for (int i = 1; i < size; i++)
	{
		if (tempVector[i] < minT) minT = tempVector[i];
		if (tempVector[i] > maxT) maxT = tempVector[i];
	}

	int pumpState = (maxT - minT > configuration.stopPumpTempDelta) ? ON : OFF;
	setPump(pumpState);
	return pumpState;
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

int main(int argc, const char** args)
{
	// -- Set confguration.ini & others directories
	setDirectories();

	// -- Check for previous fatal errors
	if (wasOverheated())
	{
		printf("Previous heater failure detected. Cannot run.\n\r");
		return EXIT_FAIL;
	}

	// -- Load settings from .ini file
	loadSettings();

	initRoomDescriptors();

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
	float kitchenTemp = getT(kitchenSensor);
	float bathroomTemp = getT(bathRoomSensor);
	float sashaBedroomTemp = getT(childrenSmallSensor); 
	float targetTemp = getTargetTemp();

	// -- Control heater and pump
	int heaterState = controlHeater(controlTemp, electricHeaterTemp, outgoingFluidTemp);

	// -- Initizlize temp vector (no paritcular order)
	float tv[10];
	int tvc = 0;
	tv[tvc++] = controlTemp;
	tv[tvc++] = electricHeaterTemp;
	tv[tvc++] = ingoingFluidTemp;
	tv[tvc++] = outgoingFluidTemp;
	tv[tvc++] = bathroomTemp;
	tv[tvc++] = kitchenTemp;
	tv[tvc++] = sashaBedroomTemp;

	int pumpState = controlPump(tv, tvc);

	// -- Individual rooms control
	/* Not tested yet */
	int i;
	for (i=0; i<ROOMS_COUNT; i++)
		controlRoom(&roomControlDescriptors[i], targetTemp);

	// -- Dates: now and when to start heating next time by our arrival
	char nowStr[TBL], onStr[TBL];
	getDateTimeStr(nowStr, TBL, time(NULL));
	getDateTimeStr(onStr, TBL, getHeatingStartTime());

	printf("%s|%4.2f|%4.2f|%4.2f| %4.2f |%4.2f|%4.2f|%4.2f|%4.2f| %4.2f|%4.2f |%4.2f|%d|%d|%c|%c|%4.1f|%s|\r\n",
		nowStr,
		electricHeaterTemp,
		ingoingFluidTemp,
		outgoingFluidTemp,
		getT(externalSensor),
		getT(amSensor),
		getT(bedroomSensor),
		getT(cabinetSensor),
		sashaBedroomTemp,
		kitchenTemp,
		bathroomTemp,
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

