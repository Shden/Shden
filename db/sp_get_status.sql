/* 
 * Depreciating. Individual calls e.g. sp_get_power_statistics, sp_get_power_statistisc
 * will have to be used.
 */

DELIMITER //
DROP PROCEDURE IF EXISTS SP_GET_STATUS;
CREATE PROCEDURE SP_GET_STATUS() 
BEGIN
	SELECT	MAX(h24.external) AS MAX_EXT_H24, 
		MIN(h24.external) AS MIN_EXT_H24, 
		AVG(h24.external) AS AVG_EXT_H24, 
		MAX(h24.control) AS MAX_INT_H24, 
		MIN(h24.control) AS MIN_INT_H24, 
		AVG(h24.control) AS AVG_INT_H24,
		d30.MAX_EXT_D30,
                d30.MIN_EXT_D30,
                d30.AVG_EXT_D30,
                d30.MAX_INT_D30,
                d30.MIN_INT_D30,
                d30.AVG_INT_D30,
		current.external AS CUR_EXT, 
		current.control AS CUR_INT,
		presence.time AS PRESENCE_TIME,
		presence.isin AS PRESENCE_ISIN
	FROM 	heating h24 
	JOIN   	(SELECT h.external, h.control FROM heating h ORDER BY time desc LIMIT 1) current
	JOIN	(SELECT	p.time, p.isin FROM presence p ORDER BY time desc LIMIT 1) presence
	JOIN	(SELECT	MAX(external) AS MAX_EXT_D30,
                	MIN(external) AS MIN_EXT_D30,
                	AVG(external) AS AVG_EXT_D30,
                	MAX(control) AS MAX_INT_D30,
                	MIN(control) AS MIN_INT_D30,
                	AVG(control) AS AVG_INT_D30
		FROM heating 
		WHERE time > DATE_SUB(NOW(), INTERVAL 30 DAY)) d30
	WHERE 	h24.time > DATE_SUB(NOW(), INTERVAL 1 DAY);

END//
DELIMITER ;

