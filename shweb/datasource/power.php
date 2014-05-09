<?php 
header('Content-type: application/json');
require_once ('../include/db.inc');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

$res = $conn->query(	
			"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':', MINUTE(time)) as time, " .
			"U1, U2, U3 " .
			"FROM power " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"ORDER BY time;");

$series = array();
$datapoint = array();

$res->data_seek(0);
while($r = $res->fetch_assoc())
{
	$datapoint[time] = $r['time'];;

	$datapoint[U1] = $r['U1'];
	$datapoint[U2] = $r['U2'];
	$datapoint[U3] = $r['U3'];
	
	$series[] = $datapoint;
}

echo json_encode($series);
?>
