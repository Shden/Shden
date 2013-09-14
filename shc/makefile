OPTIONS := -std=c99
BUILD := bin

build: controller ventilation

controller: onewireio.c controller.c 
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@ 

ventilation: onewireio.c ventilation.c
	$(CC) $^ $(OPTIONS) -o $(BUILD)/$@

clean:
	rm -f *.o controller ventilation
