build: controller ventilation

controller: onewireio.c controller.c 
	$(CC) $^ -o $@ 

ventilation: onewireio.c ventilation.c
	$(CC) $^ -o $@

clean:
	rm -f *.o controller ventilation
