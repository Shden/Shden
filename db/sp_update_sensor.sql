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

	IF sensorId = '28FF513D92150353' THEN /* hall_floor_1 */
		IF ticksCount = 0 THEN
			INSERT INTO heating (time, hall_floor_1) VALUES (ts, value);
		ELSE
			UPDATE heating SET hall_floor_1 = value WHERE time = ts;
		END IF;
	ELSEIF sensorId = '28FF3F7292150126' THEN /* hall_floor_2 */
		IF ticksCount = 0 THEN
			INSERT INTO heating (time, hall_floor_2) VALUES (ts, value);
		ELSE
			UPDATE heating SET hall_floor_2 = value WHERE time = ts;
		END IF;
	ELSEIF sensorId = '28FF263D9215036F' THEN /* hall_floor_3 */
		IF ticksCount = 0 THEN
			INSERT INTO heating (time, hall_floor_3) VALUES (ts, value);
		ELSE
			UPDATE heating SET hall_floor_3 = value WHERE time = ts;
		END IF;
	ELSE
		SIGNAL SQLSTATE '80002'
			SET MESSAGE_TEXT = 'Unknown sensorId.';
	END IF;

END//
DELIMITER ;
