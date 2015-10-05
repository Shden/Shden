<?php 
include 'sql2js.php';

header('Content-type: application/json');

$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;

echo "{\"now\":{\"outTemp\":\"$outsideTemp\",\"bedRoomTemp\":\"$bedRoomTemp\"},\"statistics\":[]";
//echo SQL2JS("CALL SP_GET_STATISTICS();");
echo "}";
?>
