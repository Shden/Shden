/*
 *	Ventilation controller module.
 *	
 *	7-Sep-2013: 	- created.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include "onewire.h"

int controlBathVentilation(float humidity)
{
	if (humidity < 75.0)
	{
		// -- all off
		changeSwitch(bathVentilationSpeed1, OFF);
		changeSwitch(bathVentilationSpeed2, OFF);
		return 0;
	}
	else if (humidity < 85.0)
	{
		// -- speed 1
		changeSwitch(bathVentilationSpeed1, ON);
		changeSwitch(bathVentilationSpeed2, OFF);
		return 1;
	}
	else
	{
		// -- speed 2
		changeSwitch(bathVentilationSpeed1, OFF);
		changeSwitch(bathVentilationSpeed2, ON);
		return 2;
	}
}

int main(int argc, const char** args)
{
	float humidity = getHumidity(bathRoomHumiditySensor);
        
	// -- Get now
	char nowStr[60];
        getDateTimeStr(nowStr, 60, time(NULL));

	printf("%s|%4.2f|%d\n\r", 
		nowStr, humidity,
		controlBathVentilation(humidity));

	return EXIT_OK;
}

