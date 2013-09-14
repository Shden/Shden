OPTIONS := -std=c99
BUILD := bin

build: heating ventilation

heating: onewireio.c heating.c 
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@ 

ventilation: onewireio.c ventilation.c
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@

clean:
	rm -f *.o heating ventilation
