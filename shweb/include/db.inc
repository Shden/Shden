<?php
$DBHost = "localhost";
$DBUser = "root";
$DBPass = "express";
$DBName = "SHDEN";

$conn = mysql_connect($DBHost, $DBUser, $DBPass) or die("Unable to connect to the database.");
mysql_select_db($DBName, $conn) or die("Unable to select database $DBName.");
?>
