DELIMITER //
DROP PROCEDURE IF EXISTS SP_HEATING_CONSUMPTION;
CREATE PROCEDURE SP_HEATING_CONSUMPTION() 
BEGIN
	DECLARE	night_tariff, day_tariff DECIMAL;

	SELECT 	DATE(time) as Date, 
		AVG(external), MIN(external), MAX(external), 
		AVG(control), 
		SUM(heating)/60 as HeatingTotalTime, 
		SUM(CASE WHEN HOUR(time)<8 THEN heating END)/60 as HeatingNightTime, 
		SUM(CASE WHEN HOUR(time)>=8 THEN heating END)/60 as HeatingDayTime, 
		SUM(heating)/60*9 as HeatingKWh 
	FROM 	heating 
	GROUP BY DATE(time);
END//
DELIMITER ;


