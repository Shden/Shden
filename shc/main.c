/*
 *	Smart house controller module.
 *	
 *	14-Nov-2010: 	- pump is controlled separately from heater allowing other heaters to work effectively.
 *			- overheating control implemented.
 *	28-NOV-2010:	- simple standby energy saving algorithm based on weekday added.
 *	10-APR-2011:	- standby temperature change from 10.0 to 8.0.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

const int OneWirePathLen = 100;

enum ExitStatus
{	
	EXIT_OK = 0,
	EXIT_FAIL = 1
};

const float presenceTargetTemp	= 20.5;		/* Target temp when we are here */
const float standbyTargetTemp	=  8.0;		/* Target temp when nobody is here */
const float tempDelta		= 0.25;
const float fluidPumpOffTemp	= 40.0;		/* Fluid temperature on heater out when to stop pump */
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

/** Stub code, to be replaced with something to get status 
 *	1 = standby
 *	0 = living mode */
int isStandby()
{
	FILE *fp;
	fp = fopen(PRECENCE_MODE_FILE, "r");
	if (NULL != fp)
	{
		fclose(fp);
		return 0; // living
	}
	return 1; // standby
}

/** Current target temperature, depending on conditions */
float getTargetTemp()
{
	if (!isStandby())
	{
		return presenceTargetTemp;
	}
	else
	{
		// -- Check weekday etc to see how to heat house
		time_t now = time(NULL);
		struct tm *ti = localtime(&now);

		// tm_wday	days since Sunday	0-6
		// i.e. sun 0, mon 1, tue 2, wed 3, thu 4, fri 5, sat 6
		int wday = ti->tm_wday;

		if (5 == wday || 6 == wday)
		{
			// -- Starting heating up at 0.00 Fri till 23:59 Sat
			return presenceTargetTemp;
		}
		return standbyTargetTemp;
	}		
}

/** Returnes combined avergage temperature to control */
float getControlTemperature()
{
	return getT(bedroomSensor);
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
		char timeStamp[100];
		getDateTimeStr(timeStamp, 100);

		// -- Persist failure info		
		FILE *fp;
		fp = fopen(HEATER_FAILURE_FILE, "w");
		if (NULL != fp)
		{
			const char* formatStr = "%s: Heater failure detected t=%4.2f.\r\n";
			fprintf(fp, formatStr, timeStamp, heaterTemp);
			fclose(fp);
			printf(formatStr, timeStamp, heaterTemp);
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
	else if (controlTemp > getTargetTemp() + tempDelta)
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
	if (OFF == getHeaterState() && currentFluidTemp < fluidPumpOffTemp)
	{
		setPump(OFF);
		return OFF;
	}
	if (currentFluidTemp >= fluidPumpOffTemp)
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

void getDateTimeStr(char *str, int length)
{
	// -- Current date and time
	time_t now = time(NULL);
	struct tm *ti = localtime(&now);
	
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
				
	// -- Current date and time
	char timeStamp[100];
	getDateTimeStr(timeStamp, 100);

	// -- Temperatures
	float controlTemp = getControlTemperature();
	float outgoingFluidTemp = getT(outputSensor);
	float heaterTemp = getT(heaterSensor);

	printf("%s %d|%4.2f|%4.2f|%4.2f||%4.2f||%4.2f|%4.2f|%4.2f||%4.2f||%d|%d||%4.1f|\r\n", 
		timeStamp,
		isStandby(),		
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
		getTargetTemp());

	return EXIT_OK;
}


/*void wait(int seconds)
{
	clock_t endwait = clock() + seconds * CLOCK_PER_SEC;
	while (clock() < endwait) {}
}*/

