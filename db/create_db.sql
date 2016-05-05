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
	heating		TINYINT,
	pump		TINYINT,
	sauna_floor	DECIMAL(5,2),
	sauna_heating	TINYINT,
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

CREATE TABLE switch (
	id		SMALLINT,
	address		CHAR(15),
	channel		CHAR(5),
	ison		TINYINT,
	max_per_hour	SMALLINT,
	max_per_day	SMALLINT,
	description	NVARCHAR(64),
	PRIMARY KEY(id)
	);
	
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1200, '3A.C19703000000', 'PIO.B', 0, 10, 60, N'Ультразвук от грызунов');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1201, '3A.843C0D000000', 'PIO.B', 0, 10, 20, N'Ключ управления электропитанием');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1202, '3A.4A370D000000', 'PIO.B', 0, 10, 20, N'Уличный фонарь на озеро');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1203, '3A.4A370D000000', 'PIO.A', 0, 10, 20, N'Свет на балконе');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1204, '3A.B8380D000000', 'PIO.A', 0, 10, 20, N'Уличный фонарь');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1205, '3A.599403000000', 'PIO.A', 0, 10, 20, N'Управление вытяжкой в сауне - скорость 1');
INSERT INTO switch (id, address, channel, ison, max_per_hour, max_per_day, description) VALUES(1206, '3A.599403000000', 'PIO.B', 0, 10, 20, N'Управление вытяжкой в сауне - скорость 2');

CREATE TABLE switch_operations (
	time		DATETIME,
	switch_id	SMALLINT,
	new_state	TINYINT
	);
	
CREATE TABLE switch_schedule (
	time		DATETIME,
	switch_id	SMALLINT,
	to_state	TINYINT
	);