DELIMITER //
DROP PROCEDURE IF EXISTS SP_GET_POWER_STATISTICS;
CREATE PROCEDURE SP_GET_POWER_STATISTICS(startDate DATETIME, endDate DATETIME) 
BEGIN
	SELECT	DATE(time) AS DATE,
		MIN(U1) AS U1_MIN,
		MAX(U1) AS U1_MAX,
		FORMAT(AVG(U1), 2) AS U1_AVG,
		FORMAT(STD(U1), 2) AS U1_STD,
		MIN(U2) AS U2_MIN,
		MAX(U2) AS U2_MAX,
		FORMAT(AVG(U2), 2) AS U2_AVG,
		FORMAT(STD(U2), 2) AS U2_STD,
		MIN(U3) AS U3_MIN,
		MAX(U3) AS U3_MAX,
		FORMAT(AVG(U3), 2) AS U3_AVG,
		FORMAT(STD(U3), 2) AS U3_STD,
		SUM(CASE WHEN U1 < 207 OR U2 < 207 OR U3 < 207 THEN 1 ELSE 0 END) AS LowVMinutes,
		SUM(CASE WHEN U1 > 253 OR U2 > 253 OR U3 > 253 THEN 1 ELSE 0 END) AS HighVMinutes,
		SUM(CASE WHEN U1 = 0 OR U2 = 0 OR U3 = 0 THEN 1 ELSE 0 END) AS CutoffMinutes
	FROM	power
	WHERE	time > startDate AND time <= endDate
	GROUP BY DATE(time)
	ORDER BY DATE desc;
END//
DELIMITER ;
