#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "onewire.h"

// Returns specific named float value of the sensor. 
float getFV(const char* sensor, const char* valueName)
{
        #ifdef DEBUG_NO_1WIRE
        return 20.0;
        #else
        FILE *fp;
        float temperature;
        char sensorPath[OneWirePathLen];
        sprintf(sensorPath, "/mnt/1wire/%s/%s", sensor, valueName);
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

float getT(const char* sensor)
{
	return getFV(sensor, "temperature");
}

void changeSwitch(const char* addr, int ison)
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

int getSwitchState(const char* addr)
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

float getHumidity(const char* sensor)
{
	return getFV(sensor, "humidity");
}




