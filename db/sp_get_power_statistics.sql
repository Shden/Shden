DELIMITER //
DROP PROCEDURE IF EXISTS SP_GET_POWER_STATISTICS;
CREATE PROCEDURE SP_GET_POWER_STATISTICS() 
BEGIN
	SELECT	MIN(U1) AS U1_MIN,
		MAX(U1) AS U1_MAX,
		AVG(U1) AS U1_AVG,
		STD(U1) AS U1_STD,
		MIN(U2) AS U2_MIN,
		MAX(U2) AS U2_MAX,
		AVG(U2) AS U2_AVG,
		STD(U2) AS U2_STD,
		MIN(U3) AS U3_MIN,
		MAX(U3) AS U3_MAX,
		AVG(U3) AS U3_AVG,
		STD(U3) AS U3_STD,
		lv.LowVoltage AS LowVoltageMinutes,
		hv.HighVoltage AS HighVoltageMinutes,
		oo.OnOffs AS CutOffsCount
	FROM	power
	JOIN   	(
			SELECT COUNT(*) as LowVoltage 
			FROM	power p 
			WHERE	p.U1 < 207 OR 
				p.U2 < 207 OR 
				p.U3 < 207 
		) lv
	JOIN   	(
			SELECT COUNT(*) as HighVoltage 
			FROM	power p 
			WHERE	p.U1 > 253 OR
				p.U2 > 253 OR
				p.U3 > 253
		) hv
	JOIN	(
			SELECT COUNT(*) as OnOffs
			FROM (
				SELECT @last AS prev_voltage, @last:=U1 + U2 + U3 AS now_voltage FROM power ORDER BY time
			) AS sub
			WHERE prev_voltage != 0 AND now_voltage = 0
		) oo
	WHERE 	time > DATE_SUB(NOW(), INTERVAL 1 DAY);
END//
DELIMITER ;
