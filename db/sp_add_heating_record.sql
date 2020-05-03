/*
 *	Deprecating. SP called by heating module to add regular status record.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_ADD_HEATING_RECORD;
CREATE PROCEDURE SP_ADD_HEATING_RECORD(
	heater 			DECIMAL(5,2),	-- heater temperature
	fluid_in		DECIMAL(5,2),	-- heater incoming fluid temperature
	fluid_out		DECIMAL(5,2),	-- heater outgoing fluid temperature
	external		DECIMAL(5,2),	-- street temperature
	am_bedroom		DECIMAL(5,2),	-- AM bedroom temperature
	bedroom			DECIMAL(5,2),	-- bedroom temperature
	cabinet			DECIMAL(5,2),	-- office temperature
	child_bedroom		DECIMAL(5,2),	-- kids bedroom temperature
	kitchen			DECIMAL(5,2),	-- kitchen temperature
	bathroom_1		DECIMAL(5,2),	-- sauna temperature
	bathroom_1_floor	DECIMAL(5,2),	-- sauna floor temperature
	control			DECIMAL(5,2),	-- control temperature
	heatingOn		TINYINT,	-- is heater on
	pumpOn			TINYINT,	-- is pump on
	bathroom_1_heatingOn	TINYINT		-- is sauna floor heating on
)
BEGIN
	DECLARE ts DATETIME;
	DECLARE ticksCount INT;

	SELECT SUBTIME(NOW(), SEC_TO_TIME(SECOND(NOW()))) INTO thisMinute;
	SELECT DATE_ADD(thisMinute, INTERVAL 1 MINUTE) INTO nextMinunte;
	SELECT MIN(time) FROM heating WHERE time >= thisMinute AND time < nextMinunte ts INTO tickTime;

	IF ISNULL(tickTime) THEN
		INSERT INTO heating
		(time, heater, fluid_in, fluid_out, external,
		am_bedroom, bedroom, cabinet, sasha_bedroom,
		kitchen, bathroom, sauna_floor, control, heating,
		pump, sauna_heating)
		VALUES (NOW(),
		heater, fluid_in, fluid_out, external,
		am_bedroom, bedroom, cabinet, child_bedroom,
		kitchen, bathroom_1, bathroom_1_floor, control, heatingOn,
		pumpOn, bathroom_1_heatingOn);

	ELSE
		UPDATE heating h
		SET h.heater = heater, h.fluid_in = fluid_in,
		h.fluid_out = fluid_out, h.external = external,
		h.am_bedroom = am_bedroom, h.bedroom = bedroom,
		h.cabinet = cabinet, h.sasha_bedroom = child_bedroom,
		h.kitchen = kitchen, h.bathroom = bathroom_1,
		h.sauna_floor = bathroom_1_floor, h.control = control,
		h.heating = heatingOn, h.pump = pumpOn,
		h.sauna_heating = bathroom_1_heatingOn
		WHERE time = tickTime;
	END IF;

END//
DELIMITER ;
