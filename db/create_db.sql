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
	
CREATE TABLE power (
	time		DATETIME,
	U1		DECIMAL(5,2),
	U2		DECIMAL(5,2),
	U3		DECIMAL(5,2),
	I1		DECIMAL(5,2),
	I2		DECIMAL(5,2),
	I3		DECIMAL(5,2),
	P1		DECIMAL(5,2),
	P2		DECIMAL(5,2),
	P3		DECIMAL(5,2),
	PS		DECIMAL(5,2),
	S1		DECIMAL(5,2),
	S2		DECIMAL(5,2),
	S3		DECIMAL(5,2),
	SS		DECIMAL(5,2),
	PRIMARY KEY(time));
