CREATE TABLE IF NOT EXISTS heating (
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
	sauna_floor	DECIMAL(5,2),
	hall_floor_1	DECIMAL(5,2),	/* 1st segment to the windows */
	hall_floor_2	DECIMAL(5,2),	/* 2nd segment in the middle */
	hall_floor_3	DECIMAL(5,2),	/* 3rd small segment */
	heating		TINYINT,
	pump		TINYINT,
	sauna_heating	TINYINT,
	PRIMARY KEY(time));

CREATE TABLE IF NOT EXISTS tariff (
	date		DATE,
	day		DECIMAL(5,2),
	night		DECIMAL(5,2),
	PRIMARY KEY(date));

CREATE TABLE IF NOT EXISTS presence (
	time		DATETIME,
	isin		INT,
	PRIMARY KEY(time));

CREATE TABLE IF NOT EXISTS humidity (
	time		DATETIME,
	bathroom	DECIMAL(5,2),
	PRIMARY KEY(time));

CREATE TABLE IF NOT EXISTS power (
	time		DATETIME,
	U1		DECIMAL(5,2),
	U2		DECIMAL(5,2),
	U3		DECIMAL(5,2),
	I1		DECIMAL(5,2),
	I2		DECIMAL(5,2),
	I3		DECIMAL(5,2),
	P1		DECIMAL(7,2),
	P2		DECIMAL(7,2),
	P3		DECIMAL(7,2),
	PS		DECIMAL(7,2),
	S1		DECIMAL(7,2),
	S2		DECIMAL(7,2),
	S3		DECIMAL(7,2),
	SS		DECIMAL(7,2),
	PRIMARY KEY(time));

/* Create DB users and grant access */
GRANT ALL ON SHDEN.* TO webuser@localhost IDENTIFIED BY 'webuser';
GRANT ALL ON SHDEN.* TO importuser@localhost IDENTIFIED BY 'importuser';
GRANT ALL ON SHDEN.* TO hubuser@localhost IDENTIFIED BY 'hubuser';
