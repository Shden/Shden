<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>График электросети</title>

	<?php include 'include/css.php';?>
	
	<link rel="stylesheet" href="css/chart.css">
</head>
<body>

	<?php 
	include 'menu.php';
	include 'chart.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 1;
	?>
	<h2>График электросети, интервал в днях: <?=$days?></h2>
	<a href="?days=1">Сутки</a> |
	<a href="?days=2">Двое суток</a> |
	<a href="?days=7">Неделя</a> |
	<a href="?days=14">2 недели</a> |
	<a href="?days=21">3 недели</a> |
	<a href="?days=31">Месяц</a> |

	<?php RenderChart("datasource/power.php?days=$days", "Напряжение (V)");?>
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

</body>
</html>