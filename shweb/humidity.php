<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Уровень влажности</title>

	<?php include 'include/css.php';?>
	
	<link rel="stylesheet" href="css/chart.css">
</head>

<body>
	<?php 
	include 'menu.php';
	include 'include/js.php';
	include 'include/chartHelper.php';
	
	RenderChartWithIntervals("Уровень влажности, интервал в днях:", "Влажность (%)", "heating/GetHumidityHistory/");
	?>
</body>
</html>