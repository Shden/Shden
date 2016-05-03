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
	if (humidity < 60.0)
	{
		// -- off
		changeSwitch(bathVentilation, OFF);
		return 0;
	}
	else if (humidity > 65.0)
	{
		// -- on
		changeSwitch(bathVentilation, ON);
		return 1;
	}
	// No change
	return 2;
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

