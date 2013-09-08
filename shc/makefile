OPTIONS := -std=c99

build: controller ventilation

controller: onewireio.c controller.c 
	$(CC) $^ $(OPTIONS) -o $@ 

ventilation: onewireio.c ventilation.c
	$(CC) $^ $(OPTIONS) -o $@

clean:
	rm -f *.o controller ventilation
