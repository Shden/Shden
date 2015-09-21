<?php 
$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;

header('Content-type: application/json');

echo "[{'time':'2015-09-20 19:00','outTemp':'$outsideTemp','bedRoomTemp':'$bedRoomTemp'}]";
?>
