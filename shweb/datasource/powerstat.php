<?php 
include 'sql2js.php';

header('Content-type: application/json');
	
$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

echo SQL2JS("CALL SP_GET_POWER_STATISTICS(DATE(DATE_ADD(NOW(), INTERVAL -$days+1 DAY)), NOW());");
?>
