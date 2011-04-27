/*
 *	Smart house controller module.
 *	
 *	14-Nov-2010: 	- pump is controlled separately from heater allowing other heaters to work effectively.
 *			- overheating control implemented.
 *	28-NOV-2010:	- simple standby energy saving algorithm based on weekday added.
 *	10-APR-2011:	- standby temperature change from 10.0 to 8.0.
 *	26-APR-2011:	- configuration goes to .ini file.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <glib.h>

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
	float		presenceTargetTemp;	/* Target temp when we are at home */
	float		standbyTargetTemp;	/* Target temp when nobody at home */
	float		tempDelta;		/* Histeresis */
	float 		fluidPumpOffTemp;	/* Fluid temperature on heater out when to stop pump */
} configuration;

const float heaterCutOffTemp	= 95.0;		/* Heater problem temperature */

enum SwitchStatus
{
	OFF = 0,
	ON = 1
//	UNCHANGED = 2
};

/* Temperature sensors */
const char* heaterSensor 	= "28.0AB28D020000"; /* датчик ТЭН */
const char* inputSensor 	= "28.EDEA6D020000"; /* жидкость на входе */
const char* outputSensor 	= "28.18DB6D020000"; /* жидкость на выходе */
const char* externalSensor 	= "28.0FF26D020000"; /* улица */
const char* amSensor 		= "28.4BC66D020000"; /* комната для гостей (АМ) */
const char* bedroomSensor 	= "28.99C68D020000"; /* спальня */
const char* cabinetSensor 	= "28.B5DE8D020000"; /* кабинет */

const char* heaterSwitch	= "/mnt/1wire/3A.3E9403000000/PIO.A";
const char* pumpSwitch		= "/mnt/1wire/3A.3E9403000000/PIO.B";

const char* HEATER_FAILURE_FILE	= "/home/den/shc/HeaterFailure";
const char* PRECENCE_MODE_FILE	= "/home/den/shc/precence.flag";

//3A.3E9403000000 - коммутатор ТЭН
//echo 1 > /mnt/1wire/3A.3E9403000000/PIO.A сам ТЭН
//echo 1 > /mnt/1wire/3A.3E9403000000/PIO.B насос


void loadSettings()
{
	GKeyFile* iniFile;
	GKeyFileFlags flags = 0;
	GError* error = NULL;

	// -- Create a new GKeyFile and prepare flags
	iniFile = g_key_file_new();

	if (!g_key_file_load_from_file(iniFile, "controller.ini", flags, &error))
	{
		g_error(error->message);
		printf(error->message);
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
	sscanf(g_key_file_get_string(iniFile, "heating", "tempDelta", NULL), "\"%f\"", &configuration.tempDelta);
	sscanf(g_key_file_get_string(iniFile, "heating", "fluidPumpOffTemp", NULL), "\"%f\"", & configuration.fluidPumpOffTemp);
}

float getT(char* sensor)
{
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
}

void changeSwitch(char* addr, int ison)
{
	FILE *fp;
	fp = fopen(addr, "w");
	if (NULL == fp)
	{
		printf("Cannot open switch %s for state changing.\n\r", addr);
		exit(EXIT_FAIL);
	}
	fprintf(fp,"%d", ison);
	fclose(fp);
	return;
}

int getSwitchState(char* addr)
{
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
	// -- Check weekday etc to see how to heat house
	time_t now = time(NULL);
	time_t start = getHeatingStartTime();
	time_t finish = mktime(&configuration.dep);

	if (now >= start && now <= finish)
	{
		return configuration.presenceTargetTemp;
	}
	return configuration.standbyTargetTemp;
}

/** Heater control routine.
 *	controlTemp - current control temperature (room or composite of rooms)
 *	heaterTemp - current heater temperature to control
 */
int controlHeater(float controlTemp, float heaterTemp)
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

	if (controlTemp < getTargetTemp())
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

	// -- Temperatures
	float controlTemp = getControlTemperature();
	float outgoingFluidTemp = getT(outputSensor);
	float heaterTemp = getT(heaterSensor);
	time_t heatingStartTime = getHeatingStartTime();
	time_t now = time(NULL);

	printf("%s|%4.2f|%4.2f|%4.2f||%4.2f||%4.2f|%4.2f|%4.2f||%4.2f||%d|%d||%4.1f|%s|\r\n", 
		ctime(&now),
		heaterTemp,
		getT(inputSensor),
		outgoingFluidTemp,
		getT(externalSensor),
		getT(amSensor),
		getT(bedroomSensor),
		getT(cabinetSensor),
		controlTemp,
		controlHeater(controlTemp, heaterTemp),
		controlPump(outgoingFluidTemp),
		getTargetTemp(),
		ctime(&heatingStartTime)
	);

	return EXIT_OK;
}


/*void wait(int seconds)
{
	clock_t endwait = clock() + seconds * CLOCK_PER_SEC;
	while (clock() < endwait) {}
}*/

