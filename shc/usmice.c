/*
 *	Ultasound against mice controller.
 *
 *	22-Sep-2013: 	- created.
 *	07-Oct-2013:	- only active in standby mode (based on DB info).
 */
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <mysql.h>
#include "onewire.h"

#define SQL_HOST	"localhost"
#define SQL_DB		"SHDEN"
#define SQL_USER	"root"
#define SQL_PWD		"express"

enum PresenceMode
{
	STANDBY	= 0,
	PRESENCE = 1
};

void finish_with_error(MYSQL *con)
{
	fprintf(stderr, "%s\n", mysql_error(con));
	mysql_close(con);
	exit(1);
}

int main(int argc, const char** args)
{
	MYSQL *con = mysql_init(NULL);

	if (NULL == con)
	{
		fprintf(stderr, "%s\n", mysql_error(con));
		exit(EXIT_FAIL);
  	}

	if (NULL == mysql_real_connect(con, SQL_HOST, SQL_USER, SQL_PWD, SQL_DB, 0, NULL, 0))
		finish_with_error(con);

	if (mysql_query(con, "CALL SP_GET_PRESENCE();"))
		finish_with_error(con);

	MYSQL_RES *result = mysql_store_result(con);

	if (NULL == result)
		finish_with_error(con);

	MYSQL_ROW row = mysql_fetch_row(result);

	if (NULL == row)
		finish_with_error(con);

	int presenceMode;
	sscanf(row[1], "%d", &presenceMode);

	int usMiceMode = (PRESENCE == presenceMode) ? OFF : ON;

	changeSwitch(usMice, usMiceMode);

	// -- Get now
	char nowStr[60];
        getDateTimeStr(nowStr, 60, time(NULL));

	printf("%s|%d\n\r",
		nowStr, usMiceMode);

	mysql_close(con);
	return EXIT_OK;
}

