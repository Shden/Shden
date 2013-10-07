DELIMITER //
DROP PROCEDURE IF EXISTS SP_CHANGE_PRESENCE;
CREATE PROCEDURE SP_CHANGE_PRESENCE(isin INT) 
BEGIN
	DECLARE	currentState INT;

	SELECT	ison INTO currentState
	FROM	presence
	WHERE	time > NOW()
	ORDER BY time
	LIMIT	1;

	IF currentState = isin THEN
		IF currentState = 0 THEN
			SIGNAL SQLSTATE '80000'
				SET MESSAGE_TEXT = 'Already in standby mode';
		ELSE
			SIGNAL SQLSTATE '80001'
				SET MESSAGE_TEXT = 'Already in presence mode';
		END IF;
	END IF;

	INSERT INTO presence
	VALUES (NOW(), isin);
END//
DELIMITER ;


