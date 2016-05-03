#ifndef FILE_ONEWIRE_SEEN
#define FILE_ONEWIRE_SEEN

/* Temperature sensors */
#define heaterSensor			"28.0AB28D020000"	/* датчик ТЭН */
#define externalSensor			"28.0FF26D020000"	/* улица */
#define outputSensor			"28.18DB6D020000"	/* жидкость на выходе */
#define amSensor			"28.ED64B4040000"	/* комната для гостей (АМ) */
#define inputSensor			"28.BCBC6D020000"	/* жидкость на входе */
#define bedroomSensor			"28.99C68D020000"	/* спальня */
#define cabinetSensor			"28.EA09B5040000"	/* кабинет */
#define kitchenSensor			"28.AAC56D020000"	/* кухня */
#define childrenSmallSensor		"28.CFE58D020000"	/* детская (Ал) */
#define bathRoomSensor			"10.AEFF8F020800"	/* ванная на 1-м этаже */
#define saunaFloorSensor		"28.E76AB4040000"	/* датчик температуры пола (душ) */

#define heaterSwitch			"/mnt/1wire/3A.3E9403000000/PIO.A"
#define pumpSwitch			"/mnt/1wire/3A.3E9403000000/PIO.B"
#define bathVentilationSpeed1		"/mnt/1wire/3A.599403000000/PIO.A"
#define bathVentilationSpeed2		"/mnt/1wire/3A.599403000000/PIO.B"
#define usMice				"/mnt/1wire/3A.C19703000000/PIO.B"
#define saunaFloorSwitch		"/mnt/1wire/3A.14280D000000/PIO.B"

#define bathRoomHumiditySensor		"26.140A56010000"

#define childrenSmallSwitch		"/mnt/1wire/3A.CB9703000000/PIO.A"

enum SwitchStatus
{
        OFF = 0,
        ON = 1
};

enum ExitStatus
{       
        EXIT_OK = 0,
        EXIT_FAIL = 1
};

#define OneWirePathLen 100

// Protos
float getT(const char* sensor);
void changeSwitch(const char* addr, int ison);
int getSwitchState(const char* addr);
float getHumidity(const char* sensor);
void getDateTimeStr(char *str, int length, time_t time);

#endif /* FILE_ONEWIRE_SEEN */

