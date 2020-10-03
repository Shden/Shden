#include <wiringPi.h>
#include <stdio.h>
#include <stdint.h>
#include <unistd.h>

// Note: Eagle shutter0.2 schematics uses BCM pin numbering.
// wiringPi has different mapping which may lead to a confusion.
// $ gpio readall has the mapping between BCM and wiringPi that is used below
#define   SDI   22 //6	// serial data input (SER) BCM pin 6 <--> GPIO.22
#define   RCLK  28 //20	// memory clock input (RCK) BCM pin 20 <--> GPIO.28
#define   SRCLK 23 //13	// shift register clock input (SCK) BCM pin 13 <--> GPIO.23

void printMapping()
{
	printf("\
----------------------------------------------------------------------------------------------------\n\
 Этаж	Назначение или помещение	Бит	Линия	Вверх		Бит	Линия	Вниз        \n\
----------------------------------------------------------------------------------------------------\n\
  1	Гардеробная на улицу		 1	 U1	0x0000-0001	17	 D1	0x0001-0000\n\
  1	Кухня				 2	 U2	0x0000-0002	18	 D2	0x0002-0000\n\
  1	Спальня на улицу		 3	 U3	0x0000-0004	19	 D3	0x0004-0000\n\
  1	Алин кабинет			 4	 U4	0x0000-0008	20	 D4	0x0008-0000\n\
  1	Холл на озеро 1			 5	 U5	0x0000-0010	21	 D5	0x0010-0000\n\
  1	Холл на озеро 2			 6	 U6	0x0000-0020	22	 D6	0x0020-0000\n\
  1	Прихожая			 7	 U7	0x0000-0040	23	 D7	0x0040-0000\n\
  2	Спальня на улицу		 8	 U8	0x0000-0080	24	 D8	0x0080-0000\n\
  2	Детская на улицу		 9	 U9	0x0000-0100	25	 D9	0x0100-0000\n\
  2	Спальня на улицу		10	U10	0x0000-0200	26	D10	0x0200-0000\n\
  2	Холл				11	U11	0x0000-0400	27	D11	0x0400-0000\n\
  2	Кабинет на озеро		12	U12	0x0000-0800	28	D12	0x0800-0000\n\
  2	Детская спальня во двор		13	U13	0x0000-1000	29	D13	0x1000-0000\n\
  2	Балкон на озеро			14	U14	0x0000-2000	30	D14	0x2000-0000\n\
  2	Балкон на озеро			15	U15	0x0000-4000	31	D15	0x0400-0000\n\
  2	Балкон во двор			16	U16	0x0000-8000	32	D16	0x8000-0000\n\
---------------------------------------------------------------------------------------------------- \
	");
}

// Negative strobe impulse at pin provided (for RCK and SCK)
void pulse(int pin)
{
	usleep(2);
	digitalWrite(pin, HIGH);
	usleep(2);
	digitalWrite(pin, LOW);
	usleep(2);
}

// Send 32-bit mask to the shift registers
int SIPO(uint32_t bitmask)
{
	// validation
	/*for (int i=0; i<16; i++)
	{
		if ((bitmask & (0x8000 >> i)) && (bitmask & (0x80000000 >> i)))
		{
			printf("Error: not open and close in the same time in postion %d.\n", i);
			return 0;
		}
	}*/

	//digitalWrite(RCLK, LOW);
	for (int i=0; i<32; i++)
	{
		digitalWrite(SDI, (bitmask & (0x80000000 >> i)) != 0);
		pulse(SRCLK);
	}
	//digitalWrite(RCLK, HIGH);
	pulse(RCLK);

	return 1;
}

// GPIO initialisation
void init(void)
{
	pinMode(SDI, OUTPUT);
	pinMode(RCLK, OUTPUT);
	pinMode(SRCLK, OUTPUT);

	digitalWrite(SDI, LOW);
	digitalWrite(RCLK, LOW);
	digitalWrite(SRCLK, LOW);
}

int main(void)
{
	if (wiringPiSetup() == -1)
	{
		// when initialize wiring failed, print message to screen
		printf("setup wiringPi failed !");
		return 1;
	}

	init();

	printMapping();

	while(1)
	{
		uint32_t status;

		printf("\nEnter 32-bit hex status bitmask: ");
		scanf("%x", &status);

		if (SIPO(status))
			printf("Status updated: 0x%08X", status);
	}
}

