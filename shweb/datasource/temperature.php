<?php 
include 'sql2js.php';

header('Content-type: application/json');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

echo SQL2JS(	
	"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':00') as time, " .
	"AVG(external) as outTemp, " .
	"AVG(bedroom) as bedRoomTemp " .
	"FROM heating " .
	"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
	"GROUP BY HOUR(time), DATE(time) " .
	"ORDER BY DATE(time), HOUR(time);"
);
?>
