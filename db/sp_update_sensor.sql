/*
 *	SP to be called by sensor data posting API e.g. API/1.1/climate/data/temperature
 *	to persist data points from sensors.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_UPDATE_SENSOR;
CREATE PROCEDURE SP_UPDATE_SENSOR(sensorId VARCHAR(16), value DECIMAL(5,2))
BEGIN

	DECLARE ts DATETIME;
	DECLARE ticksCount INT;

	SELECT NOW() INTO ts;
	SELECT COUNT(*) FROM heating WHERE time = ts INTO ticksCount;

	IF sensorId = '28FF72BF47160342' THEN /* test sensorId => cabinet */
		IF ticksCount = 0 THEN
			INSERT INTO heating (time, cabinet) VALUES (ts, value);
		ELSE
			UPDATE heating SET cabinet = value WHERE time = ts;
		END IF;
	ELSE
		SIGNAL SQLSTATE '80002'
			SET MESSAGE_TEXT = 'Unknown sensorId.';
	END IF;

END//
DELIMITER ;
