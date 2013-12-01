DELIMITER //
DROP PROCEDURE IF EXISTS SP_GET_STATUS;
CREATE PROCEDURE SP_GET_STATUS() 
BEGIN
	SELECT	MAX(hh.external) AS MAX_EXT, 
		MIN(hh.external) AS MIN_EXT, 
		AVG(hh.external) AS AVG_EXT, 
		MAX(hh.control) AS MAX_INT, 
		MIN(hh.control) AS MIN_INT, 
		AVG(hh.control) AS AVG_INT, 
		current.external AS CUR_EXT, 
		current.control AS CUR_INT,
		presence.time AS PRESENCE_TIME,
		presence.isin AS PRESENCE_ISIN
	FROM 	heating hh 
	JOIN   	(SELECT h.external, h.control FROM heating h ORDER BY time desc LIMIT 1) current
	JOIN	(SELECT	p.time, p.isin FROM presence p ORDER BY time desc LIMIT 1) presence
	WHERE 	hh.time > DATE_SUB(NOW(), INTERVAL 1 DAY);

END//
DELIMITER ;

