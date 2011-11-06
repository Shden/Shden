/*
 *	Smart house controller module.
 *	
 *	14-Nov-2010: 	- pump is controlled separately from heater allowing other heaters to work effectively.
 *					- overheating control implemented.
 *	28-NOV-2010:	- simple standby energy saving algorithm based on weekday added.
 *	10-APR-2011:	- standby temperature change from 10.0 to 8.0.
 *	26-APR-2011:	- configuration goes to .ini file.
 *	01-MAY-2011:	- turn off heater logic added to work with external heater.
 *	11-SEP-2011:	- kitchen sensor added.
 *	07-OCT-2011:	- per room heating control added.
 *	07-NOV-2011:	- night tariff & energy saving in standby mode implemented.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <glib.h>

//#define DEBUG_NO_1WIRE	// Should be DEBUG_NO_1WIRE to run without 1-wire net

const int OneWirePathLen = 100;

enum ExitStatus
{	
	EXIT_OK = 0,
	EXIT_FAIL = 1
};

/* Configuration data lives here */
struct ConfigT
{
	struct tm	arrive;
	struct tm	dep;
	float		presenceTargetTemp;			/* Target temp when we are at home */
	float		standbyTargetTemp;			/* Target temp when nobody at home (day) */
	float		standbyTargetNightTemp;		/* Target temp when nobody at home (night) */
	float		tempDelta;					/* Histeresis */
	float 		fluidPumpOffTemp;			/* Fluid temperature on heater out when to stop pump */
	float		fluidElectroHeaterOffTemp;	/* Fluid temperature when electic heater is off, only coal will work */
} configuration;

const float heaterCutOffTemp	= 95.0;		/* Heater failure temperature */

enum SwitchStatus
{
	OFF = 0,
	ON = 1
//	UNCHANGED = 2
};

/* Tariff section */
const int nightTariffStartHour	= 0;	/* actually 23 to 7 but meanwhile they failed to */
const int nightTariffEndHour	= 8;	/* block powermeters to stop swithing to winter time :) /*

/* Temperature sensors */
const char* heaterSensor 		= "28.0AB28D020000"; /* датчик ТЭН */
const char* externalSensor 		= "28.0FF26D020000"; /* улица */
const char* outputSensor 		= "28.18DB6D020000"; /* жидкость на выходе */
const char* amSensor 			= "28.4BC66D020000"; /* комната для гостей (АМ) */
const char* inputSensor 		= "28.EDEA6D020000"; /* жидкость на входе */
const char* bedroomSensor 		= "28.99C68D020000"; /* спальня */
const char* cabinetSensor 		= "28.B5DE8D020000"; /* кабинет */
const char* kitchenSensor		= "28.AAC56D020000"; /* кухня */
const char* childrenSmallSensor	= "28.CFE58D020000"; /* детская (Ал) */

const char* heaterSwitch		= "/mnt/1wire/3A.3E9403000000/PIO.A";
const char* pumpSwitch			= "/mnt/1wire/3A.3E9403000000/PIO.B";

const char* childrenSmallSwitch	= "/mnt/1wire/3A.CB9703000000/PIO.A"; /* heating switch in the small children room */

/* Absolute paths! Unfortunately still need them to run under cron, but have to be refactored */
const char* iniFilePath			= "/home/den/shc/controller.ini";
const char* HEATER_FAILURE_FILE	= "/home/den/shc/HeaterFailure";

#define 	ROOMS_COUNT 	5

/* Room control descriptor */
typedef struct TRoomControlDescriptor
{
	char*		sensorAddress;			/* Address of temperature sensor of the room */
	float		temperatureCorrection;	/* Temperature correction, 0 if no correction needed, >0 if sensor returns less that actually <0 otherwise */
	char*		switchAddress;			/* Address of room's heating switch */
} RoomControlDescriptor;

RoomControlDescriptor roomControlDescriptors[ROOMS_COUNT];

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
	GKeyFile* iniFile;
	GKeyFileFlags flags = 0;
	GError* error = NULL;

	// -- Create a new GKeyFile and prepare flags
	iniFile = g_key_file_new();

	if (!g_key_file_load_from_file(iniFile, iniFilePath, flags, &error))
	{
		printf(error->message);
		g_error(error->message);
		exit(EXIT_FAIL);
	}

	// -- arrival date & hour	
	configuration.arrive.tm_sec = configuration.arrive.tm_min = 0;
	sscanf(g_key_file_get_string(iniFile, "schedule", "arrive_hour", NULL), "\"%d\"", &configuration.arrive.tm_hour);
	sscanf(g_key_file_get_string(iniFile, "schedule", "arrive_date", NULL), "\"%d.%d.%d\"",
		&configuration.arrive.tm_mday, &configuration.arrive.tm_mon, &configuration.arrive.tm_year);
	configuration.arrive.tm_year -= 1900;
	configuration.arrive.tm_mon -= 1;
	configuration.arrive.tm_hour -= 1;
	mktime(&configuration.arrive);

	// -- departure date & hour
	configuration.dep.tm_sec = configuration.dep.tm_min = 0;
	sscanf(g_key_file_get_string(iniFile, "schedule", "dep_hour", NULL), "\"%d\"", &configuration.dep.tm_hour);
	sscanf(g_key_file_get_string(iniFile, "schedule", "dep_date", NULL), "\"%d.%d.%d\"",
		&configuration.dep.tm_mday, &configuration.dep.tm_mon, &configuration.dep.tm_year);
	configuration.dep.tm_year -= 1900;
	configuration.dep.tm_mon -= 1;
	configuration.dep.tm_hour -= 1;
	mktime(&configuration.dep);

	// -- presenceTargetTemp && standbyTargetTemp
	sscanf(g_key_file_get_string(iniFile, "heating", "presence", NULL), "\"%f\"", &configuration.presenceTargetTemp);
	sscanf(g_key_file_get_string(iniFile, "heating", "standby", NULL), "\"%f\"", &configuration.standbyTargetTemp);
	sscanf(g_key_file_get_string(iniFile, "heating", "standby_night", NULL), "\"%f\"", &configuration.standbyTargetNightTemp);
	sscanf(g_key_file_get_string(iniFile, "heating", "tempDelta", NULL), "\"%f\"", &configuration.tempDelta);
	sscanf(g_key_file_get_string(iniFile, "heating", "fluidPumpOffTemp", NULL), "\"%f\"", &configuration.fluidPumpOffTemp);
	sscanf(g_key_file_get_string(iniFile, "heating", "fluidElectroHeaterOffTemp", NULL), "\"%f\"", &configuration.fluidElectroHeaterOffTemp);
}

float getT(char* sensor)
{
	#ifdef DEBUG_NO_1WIRE
	return 20.0;
	#else
	FILE *fp;
	float temperature;
	char* sensorPath[OneWirePathLen];
	sprintf(sensorPath, "/mnt/1wire/%s/temperature", sensor);
	fp = fopen(sensorPath, "r");
	if (fp == NULL)
	{
		printf("Cannot open sensor %s\n\r", sensor);
		exit(EXIT_FAIL);
	}
	fscanf(fp, "%f", &temperature);
	fclose(fp); 
	return temperature;
	#endif
}

void changeSwitch(char* addr, int ison)
{
	#ifndef DEBUG_NO_1WIRE
	FILE *fp;
	fp = fopen(addr, "w");
	if (NULL == fp)
	{
		printf("Cannot open switch %s for state changing.\n\r", addr);
		exit(EXIT_FAIL);
	}
	fprintf(fp,"%d", ison);
	fclose(fp);
	#endif
	return;
}

int getSwitchState(char* addr)
{
	#ifndef DEBUG_NO_1WIRE
	FILE *fp;
	fp = fopen(addr, "r");
	if (NULL == fp)
	{
		printf("Cannot open switch %s for state reading.\n\r", addr);
		exit(EXIT_FAIL);
	}
	int state = OFF;
	fscanf(fp, "%d", &state);
	fclose(fp);
	return state;
	#else
	return 0;
	#endif
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
	const float heatUpSpeed = 0.5;	// speed of heating up, C/hour.
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
	time_t now = time(NULL);
	time_t start = getHeatingStartTime();
	time_t finish = mktime(&configuration.dep);

	if (now >= start && now <= finish)
	{
		return configuration.presenceTargetTemp;
	}

	// -- If in standby, check day/night targets to save power
	struct tm *ti = localtime(&now);

	if (ti->tm_hour >= nightTariffStartHour && ti->tm_hour < nightTariffEndHour)
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
 *	heaterTemp - current heater temperature to control
 *	currentFluidTemp - current temperature of the fluid
 */
int controlHeater(float controlTemp, float heaterTemp, float currentFluidTemp)
{
	/* First chech heater is OK */
	if (heaterTemp > heaterCutOffTemp)
	{
		// -- Current date and time
		time_t now = time(NULL);

		// -- Persist failure info		
		FILE *fp;
		fp = fopen(HEATER_FAILURE_FILE, "w");
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

	if (currentFluidTemp > configuration.fluidElectroHeaterOffTemp)
	{
		// Other heater has created enough temperature, no need to run electricity
		setHeater(OFF);
		return OFF;
	}
	else if (controlTemp < getTargetTemp())
	{
		setHeater(ON);
		setPump(ON);
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

int controlPump(float currentFluidTemp)
{
	if (OFF == getHeaterState() && currentFluidTemp < configuration.fluidPumpOffTemp)
	{
		setPump(OFF);
		return OFF;
	}
	if (currentFluidTemp >= configuration.fluidPumpOffTemp)
	{
		setPump(ON);
		return ON;
	}
	return getPumpState();
}

int wasOverheated()
{
	FILE *fp;
	fp = fopen(HEATER_FAILURE_FILE, "r");
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

int main()
{
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
	float heaterTemp = getT(heaterSensor);
	float targetTemp = getTargetTemp();

	// -- Control heater and pump
	int heaterState = controlHeater(controlTemp, heaterTemp, outgoingFluidTemp);
	int pumpState = controlPump(outgoingFluidTemp);

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

	printf("%s|%4.2f|%4.2f|%4.2f||%4.2f||%4.2f|%4.2f|%4.2f|%4.2f|%4.2f||%4.2f||%d|%d||%4.1f|%s|\r\n", 
		nowStr,
		heaterTemp,
		getT(inputSensor),
		outgoingFluidTemp,
		getT(externalSensor),
		getT(amSensor),
		getT(bedroomSensor),
		getT(cabinetSensor),
		getT(kitchenSensor),
		getT(childrenSmallSensor),
		controlTemp,
		heaterState,
		pumpState,
		targetTemp,
		onStr
	);

	return EXIT_OK;
}


/*void wait(int seconds)
{
	clock_t endwait = clock() + seconds * CLOCK_PER_SEC;
	while (clock() < endwait) {}
}*/

