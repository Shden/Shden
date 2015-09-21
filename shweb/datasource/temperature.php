<?php 
$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;

header('Content-type: application/json');

echo "[{\"outTemp\":\"$outsideTemp\",\"bedRoomTemp\":\"$bedRoomTemp\"}]";
?>
