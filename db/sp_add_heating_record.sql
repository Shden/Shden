/*
 *	Deprecating. SP called by heating module to add regular status record.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_ADD_HEATING_RECORD;
CREATE PROCEDURE SP_ADD_HEATING_RECORD(
	fluid_in		DECIMAL(5,2),	-- 1: boiler incoming fluid temperature from 1-wire sensor
        fluid_in_b              DECIMAL(5,2),   -- 2: boiler incoming fluid temperature from boiler built-in sensor
	fluid_out		DECIMAL(5,2),	-- 3: boiler outgoing fluid temperature from 1-wire sensor
        fluid_out_b             DECIMAL(5,2),   -- 4: boiler outgoing fluid temperature from boiler built-in sensor
	external		DECIMAL(5,2),	-- 5: outside temperature from 1-wire sensor
        external_b              DECIMAL(5,2),   -- 6: outside temperature from boiler sensor
	coliving		DECIMAL(5,2),	-- 7: co-living temperature
	bedroom			DECIMAL(5,2),	-- 8: our bedroom temperature
	cabinet			DECIMAL(5,2),	-- 9: office temperature
	child_bedroom		DECIMAL(5,2),	-- 10: small kids bedroom temperature
	kitchen			DECIMAL(5,2),	-- 11: kitchen temperature
	bathroom_1		DECIMAL(5,2),	-- 12: 1st floor bathroom temperature
	bathroom_1_floor	DECIMAL(5,2),	-- 13: 1st floor bathroom floor temperature
        hall_1_floor            DECIMAL(5,2),   -- 14: 1st floor hall floor temperature
        pressure_b              DECIMAL(5,2)    -- 15: boiler circuit pressure
)
BEGIN
	INSERT INTO heating
	(time, fluid_in, fluid_in_b, fluid_out, fluid_out_b, 
        external, external_b, coliving, bedroom, cabinet, child_bedroom,
	kitchen, bathroom, sauna_floor, hall_1_floor, pressure_b)
	VALUES (NOW(),
	fluid_in, fluid_in_b, fluid_out, fluid_out_b, 
        external, external_b, coliving, bedroom, cabinet, child_bedroom,
	kitchen, bathroom_1, bathroom_1_floor, hall_1_floor, pressure_b);
END//
DELIMITER ;
