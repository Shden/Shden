CREATE TABLE heating (
	time 		DATETIME,
	external 	DECIMAL(5,2),
	fluid_in 	DECIMAL(5,2),
	heater 		DECIMAL(5,2),
	fluid_out 	DECIMAL(5,2),
	bedroom 	DECIMAL(5,2),
	kitchen 	DECIMAL(5,2),
	PRIMARY KEY(time));
