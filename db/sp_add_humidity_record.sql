/*
 *	SP called by to add humidity record.
 */
DELIMITER //
DROP PROCEDURE IF EXISTS SP_ADD_HUMIDITY_RECORD;
CREATE PROCEDURE SP_ADD_HUMIDITY_RECORD(
	bathroom 	DECIMAL(5,2)	-- 1st floor bathroom humidity
)
BEGIN
	INSERT INTO humidity(time, bathroom)
	VALUES (NOW(), bathroom);
END//
DELIMITER ;
