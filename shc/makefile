OUT := bin

build: controller ventilation

controller: onewireio.c controller.c 
	$(CC) $^ -o $(OUT)/$@ 

ventilation: onewireio.c ventilation.c
	$(CC) $^ -o $(OUT)/$@

clean:
	rm -f *.o controller ventilation
