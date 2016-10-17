OPTIONS := -std=c99
BUILD := bin

build: usmice

usmice: onewireio.c time.c usmice.c
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@ `mysql_config --cflags --libs`

clean:
	rm -f *.o $(BUILD)/usmice
