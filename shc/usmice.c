/*
 *	Ultasound against mice controller.
 *	
 *	22-Sep-2013: 	- created.
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include "onewire.h"

int main(int argc, const char** args)
{
	changeSwitch(usMice, ON);
        
	// -- Get now
	char nowStr[60];
        getDateTimeStr(nowStr, 60, time(NULL));

	printf("%s|%d\n\r", 
		nowStr, ON);

	return EXIT_OK;
}

