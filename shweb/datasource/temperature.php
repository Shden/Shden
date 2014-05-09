<?php 
header('Content-type: application/json');
require_once ('../include/db.inc');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

$res = $conn->query(	"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':00') as time, " .
			"AVG(external) as outTemp, " .
			"AVG(bedroom) as bedRoomTemp " .
			"FROM heating " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"GROUP BY HOUR(time), DATE(time) " .
			"ORDER BY DATE(time), HOUR(time);");

$series = array();
$datapoint = array();

$res->data_seek(0);
while($r = $res->fetch_assoc())
{
	$datapoint[time] = $r['time'];;
	$datapoint[спальня] = number_format($r['bedRoomTemp'], 2);
	$datapoint[наружная] = number_format($r['outTemp'], 2);

	$series[] = $datapoint;
}

echo json_encode($series);
?>
