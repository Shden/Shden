SELECT 	DATE(time) as Date, AVG(external), MIN(external), MAX(external), AVG(control), 
	SUM(heating)/60 as HeatingTime, SUM(heating)/60*9 as HeatingKWh 
FROM 	heating 
GROUP BY DATE(time);
