/*
 *	Deprecating. SP called by heating module to add regular status record.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_ADD_HEATING_RECORD;
CREATE PROCEDURE SP_ADD_HEATING_RECORD(
	heater 			DECIMAL(5,2),	-- 1 heater temperature
	fluid_in		DECIMAL(5,2),	-- 2 heater incoming fluid temperature
	fluid_out		DECIMAL(5,2),	-- 3 heater outgoing fluid temperature
	external		DECIMAL(5,2),	-- 4 street temperature
	am_bedroom		DECIMAL(5,2),	-- 5 AM bedroom temperature
	bedroom			DECIMAL(5,2),	-- 6 bedroom temperature
	cabinet			DECIMAL(5,2),	-- 7 office temperature
	child_bedroom		DECIMAL(5,2),	-- 8 kids bedroom temperature
	kitchen			DECIMAL(5,2),	-- 9 kitchen temperature
	bathroom_1		DECIMAL(5,2),	-- 10 sauna temperature
	bathroom_1_floor	DECIMAL(5,2),	-- 11 sauna floor temperature
	control			DECIMAL(5,2),	-- 12 control temperature
	hall_floor_1		DECIMAL(5,2),	-- 13 1st segment to windows
	hall_floor_2		DECIMAL(5,2),	-- 14 2nd segment in the middle
	hall_floor_3		DECIMAL(5,2)	-- 15 3rd small segment
)
BEGIN
	INSERT INTO heating
	(time, heater, fluid_in, fluid_out, external,
	am_bedroom, bedroom, cabinet, sasha_bedroom,
	kitchen, bathroom, sauna_floor, control,
	hall_floor_1, hall_floor_2, hall_floor_3)
	VALUES (NOW(),
	heater, fluid_in, fluid_out, external,
	am_bedroom, bedroom, cabinet, child_bedroom,
	kitchen, bathroom_1, bathroom_1_floor, control,
	hall_floor_1, hall_floor_2, hall_floor_3);
END//
DELIMITER ;
