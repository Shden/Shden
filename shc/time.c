#include <time.h>
#include <stdio.h>
	
void getDateTimeStr(char *str, int length, time_t time)
{
        struct tm *ti = localtime(&time);

        snprintf(str, length, "%4d-%02d-%02d %02d:%02d:%02d", 
                ti->tm_year+1900, ti->tm_mon+1, ti->tm_mday, 
                ti->tm_hour, ti->tm_min, ti->tm_sec);
}