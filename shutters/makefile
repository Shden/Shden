CFLAGS = -g
LIBS = -lwiringPi
OBJS = main.o


test: $(OBJS)
	$(CC) -o test $(CFLAGS) $(OBJS) $(LIBS)
clean:
	rm *.o test
