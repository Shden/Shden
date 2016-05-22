/*
 * House statistics from time series (temperature, humidity, power etc.)
 */

DELIMITER //
DROP PROCEDURE IF EXISTS SP_GET_STATISTICS;
CREATE PROCEDURE SP_GET_STATISTICS() 
BEGIN
	-- 1 hour
	---- temperature
	SELECT	1 AS PERIOD,
		MAX(external) AS MAX_EXT, 
		MIN(external) AS MIN_EXT, 
		FORMAT(AVG(external), 2) AS AVG_EXT, 
		MAX(control) AS MAX_INT, 
		MIN(control) AS MIN_INT, 
		FORMAT(AVG(control), 2) AS AVG_INT,
		FORMAT(pw.STD, 2) AS STD,
		pw.LowVMinutes AS LowVMinutes,
		pw.HighVMinutes AS HighVMinutes,
		pw.CutoffMinutes AS CutoffMinutes
	FROM 	heating
	---- power
	JOIN
	(
	SELECT
		(STD(U1) + STD(U2) + STD(U3))/3 AS STD,
		SUM(CASE WHEN U1 < 207 OR U2 < 207 OR U3 < 207 THEN 1 ELSE 0 END) AS LowVMinutes,
		SUM(CASE WHEN U1 > 253 OR U2 > 253 OR U3 > 253 THEN 1 ELSE 0 END) AS HighVMinutes,
		SUM(CASE WHEN U1 = 0 OR U2 = 0 OR U3 = 0 THEN 1 ELSE 0 END) AS CutoffMinutes
	FROM	power
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
	) pw
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
	-- 24 hours
	---- temperature
	UNION
	SELECT	24 AS PERIOD,
		MAX(external) AS MAX_EXT, 
		MIN(external) AS MIN_EXT, 
		FORMAT(AVG(external), 2) AS AVG_EXT, 
		MAX(control) AS MAX_INT, 
		MIN(control) AS MIN_INT, 
		FORMAT(AVG(control), 2) AS AVG_INT,
		FORMAT(pw.STD, 2) AS STD,
		pw.LowVMinutes AS LowVMinutes,
		pw.HighVMinutes AS HighVMinutes,
		pw.CutoffMinutes AS CutoffMinutes
	FROM 	heating
	---- power
	JOIN
	(
	SELECT
		(STD(U1) + STD(U2) + STD(U3))/3 AS STD,
		SUM(CASE WHEN U1 < 207 OR U2 < 207 OR U3 < 207 THEN 1 ELSE 0 END) AS LowVMinutes,
		SUM(CASE WHEN U1 > 253 OR U2 > 253 OR U3 > 253 THEN 1 ELSE 0 END) AS HighVMinutes,
		SUM(CASE WHEN U1 = 0 OR U2 = 0 OR U3 = 0 THEN 1 ELSE 0 END) AS CutoffMinutes
	FROM	power
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
	) pw
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 DAY)
	UNION
	-- 1 week 
	---- temperature
	SELECT	24 * 7,
		MAX(external) AS MAX_EXT, 
		MIN(external) AS MIN_EXT, 
		FORMAT(AVG(external), 2) AS AVG_EXT, 
		MAX(control) AS MAX_INT, 
		MIN(control) AS MIN_INT, 
		FORMAT(AVG(control), 2) AS AVG_INT,
		FORMAT(pw.STD, 2) AS STD,
		pw.LowVMinutes AS LowVMinutes,
		pw.HighVMinutes AS HighVMinutes,
		pw.CutoffMinutes AS CutoffMinutes
	FROM 	heating
	---- power
	JOIN
	(
	SELECT
		(STD(U1) + STD(U2) + STD(U3))/3 AS STD,
		SUM(CASE WHEN U1 < 207 OR U2 < 207 OR U3 < 207 THEN 1 ELSE 0 END) AS LowVMinutes,
		SUM(CASE WHEN U1 > 253 OR U2 > 253 OR U3 > 253 THEN 1 ELSE 0 END) AS HighVMinutes,
		SUM(CASE WHEN U1 = 0 OR U2 = 0 OR U3 = 0 THEN 1 ELSE 0 END) AS CutoffMinutes
	FROM	power
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 WEEK)
	) pw
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 WEEK)
	UNION
	-- 1 month (4 weeks, 28 days) 
	---- temperature
	SELECT	24 * 7 * 4,
		MAX(external) AS MAX_EXT, 
		MIN(external) AS MIN_EXT, 
		FORMAT(AVG(external), 2) AS AVG_EXT, 
		MAX(control) AS MAX_INT, 
		MIN(control) AS MIN_INT, 
		FORMAT(AVG(control), 2) AS AVG_INT,
		FORMAT(pw.STD, 2) AS STD,
		pw.LowVMinutes AS LowVMinutes,
		pw.HighVMinutes AS HighVMinutes,
		pw.CutoffMinutes AS CutoffMinutes
	FROM 	heating
	---- power
	JOIN
	(
	SELECT
		(STD(U1) + STD(U2) + STD(U3))/3 AS STD,
		SUM(CASE WHEN U1 < 207 OR U2 < 207 OR U3 < 207 THEN 1 ELSE 0 END) AS LowVMinutes,
		SUM(CASE WHEN U1 > 253 OR U2 > 253 OR U3 > 253 THEN 1 ELSE 0 END) AS HighVMinutes,
		SUM(CASE WHEN U1 = 0 OR U2 = 0 OR U3 = 0 THEN 1 ELSE 0 END) AS CutoffMinutes
	FROM	power
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 28 DAY)
	) pw
	WHERE	time > DATE_SUB(NOW(), INTERVAL 28 DAY);

END//
DELIMITER ; 