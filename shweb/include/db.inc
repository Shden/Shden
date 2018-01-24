<?php
$DBHost = "127.0.0.1";
$DBUser = "webuser";
$DBPass = "webuser";
$DBName = "SHDEN";

$conn = new mysqli($DBHost, $DBUser, $DBPass, $DBName) or die("Unable to connect to the database.");
?>
