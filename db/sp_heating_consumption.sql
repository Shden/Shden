DELIMITER //
DROP PROCEDURE IF EXISTS SP_HEATING_CONSUMPTION;
CREATE PROCEDURE SP_HEATING_CONSUMPTION(startDate DATE, endDate DATE) 
BEGIN
	DECLARE	nightTariff, dayTariff DECIMAL;

	SELECT	day INTO dayTariff
	FROM	tariff 
	ORDER BY date
	LIMIT	1;

	SELECT	night INTO nightTariff
	FROM	tariff 
	ORDER BY date
	LIMIT	1;

	SELECT 	DATE(time) as Date, 
		AVG(external) as AvgOutside, 
		MIN(external) as MinOutside, 
		MAX(external) as MaxOutside, 
		AVG(control) as Inside, 
		SUM(heating)/60 as HeatingTotalTime, 
		SUM(CASE WHEN HOUR(time)<8 THEN heating END)/60 as HeatingNightTime, 
		SUM(CASE WHEN HOUR(time)>=8 THEN heating END)/60 as HeatingDayTime, 
		SUM(CASE WHEN HOUR(time)<8 THEN heating END)/60 * 9 * nightTariff as NightCost,
		SUM(CASE WHEN HOUR(time)>=8 THEN heating END)/60 * 9 * dayTariff as DayCost, 
		SUM(CASE WHEN HOUR(time)<8 THEN heating END)/60 * 9 * nightTariff +
		SUM(CASE WHEN HOUR(time)>=8 THEN heating END)/60 * 9 * dayTariff as TotalCost, 
		SUM(heating)/60*9 as HeatingKWh 
	FROM 	heating 
	WHERE	time >= startDate AND time < endDate
	GROUP BY DATE(time);
END//
DELIMITER ;


