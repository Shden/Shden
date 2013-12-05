<?php
$DBHost = "127.0.0.1";
$DBUser = "root";
$DBPass = "express";
$DBName = "SHDEN";

$conn = new mysqli($DBHost, $DBUser, $DBPass, $DBName) or die("Unable to connect to the database.");
?>
