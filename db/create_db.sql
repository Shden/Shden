CREATE TABLE heating (
	time 		DATETIME,
	heater 		DECIMAL(5,2),
	fluid_in 	DECIMAL(5,2),
	fluid_out 	DECIMAL(5,2),
	external 	DECIMAL(5,2),
	am_bedroom 	DECIMAL(5,2),
	bedroom 	DECIMAL(5,2),
	cabinet 	DECIMAL(5,2),
	sasha_bedroom 	DECIMAL(5,2),
	kitchen 	DECIMAL(5,2),
	bathroom 	DECIMAL(5,2),
	control 	DECIMAL(5,2),
	heating		INT,
	pump		INT,
	PRIMARY KEY(time));

CREATE TABLE tariff (
	date		DATE,
	day		DECIMAL(5,2),
	night		DECIMAL(5,2),
	PRIMARY KEY(date));

CREATE TABLE presence (
	time		DATETIME,
	isin		INT,
	PRIMARY KEY(time));
	
CREATE TABLE humidity (
	time		DATETIME,
	bathroom	DECIMAL(5,2),
	PRIMARY KEY(time));
