/*
 *	SP called by to add network statistics record.
 */
 DELIMITER //
DROP PROCEDURE IF EXISTS SP_ADD_NETWORK_RECORD;
CREATE PROCEDURE SP_ADD_HEATING_RECORD(
	google		INT,
	yandex		INT,
	SHWADE		INT,
	VPN		INT
)
BEGIN
	INSERT INTO network
	(time, google, yandex, SHWADE, VPN)
	VALUES (NOW(), google, yandex, SHWADE, VPN);
END//
DELIMITER ;
