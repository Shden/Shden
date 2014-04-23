OPTIONS := -std=c99
BUILD := bin

build: heating ventilation usmice

heating: onewireio.c time.c heating.c 
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@ 

ventilation: onewireio.c time.c ventilation.c
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@

usmice: onewireio.c time.c usmice.c
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@ `mysql_config --cflags --libs`

clean:
	rm -f *.o $(BUILD)/heating $(BUILD)/ventilation $(BUILD)/usmice
