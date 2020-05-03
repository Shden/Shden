/*
 *	SP to be called by sensor data posting API e.g. API/1.1/climate/data/temperature
 *	to persist data points from sensors.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_UPDATE_SENSOR;
CREATE PROCEDURE SP_UPDATE_SENSOR(sensorId VARCHAR(16), value DECIMAL(5,2))
BEGIN

	DECLARE thisMinute, nextMinunte, tickTime DATETIME;

	SELECT SUBTIME(NOW(), SEC_TO_TIME(SECOND(NOW()))) INTO thisMinute;
	SELECT DATE_ADD(thisMinute, INTERVAL 1 MINUTE) INTO nextMinunte;
	SELECT MIN(time) FROM heating WHERE time >= thisMinute AND time < nextMinunte ts INTO tickTime;

	IF sensorId = '28FF513D92150353' THEN /* hall_floor_1 */
		IF ISNULL(tickTime) THEN
			INSERT INTO heating (time, hall_floor_1) VALUES (NOW(), value);
		ELSE
			UPDATE heating SET hall_floor_1 = value WHERE time = tickTime;
		END IF;
	ELSEIF sensorId = '28FF3F7292150126' THEN /* hall_floor_2 */
		IF ISNULL(tickTime) THEN
			INSERT INTO heating (time, hall_floor_2) VALUES (NOW(), value);
		ELSE
			UPDATE heating SET hall_floor_2 = value WHERE time = tickTime;
		END IF;
	ELSEIF sensorId = '28FF263D9215036F' THEN /* hall_floor_3 */
		IF ISNULL(tickTime) THEN
			INSERT INTO heating (time, hall_floor_3) VALUES (NOW(), value);
		ELSE
			UPDATE heating SET hall_floor_3 = value WHERE time = tickTime;
		END IF;
	ELSE
		SIGNAL SQLSTATE '80002'
			SET MESSAGE_TEXT = 'Unknown sensorId.';
	END IF;

END//
DELIMITER ;
