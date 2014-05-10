<?php 
include 'sql2js.php';

header('Content-type: application/json');
	
$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

echo SQL2JS(
	"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':00') as time, " .
	"AVG(U1) AS U1, AVG(U2) AS U2, AVG(U3) AS U3 " .
	"FROM power " .
	"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
	"GROUP BY HOUR(time), DATE(time) " .
	"ORDER BY DATE(time), HOUR(time);"
);

?>
