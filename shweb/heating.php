<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Температурный график</title>

	<?php include 'include/css.php';?>
	
	<link rel="stylesheet" href="css/chart.css">
</head>

<body>
	<?php 
	include 'menu.php';
	include 'chart.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 1;
	?>
	
	<h2>Температурный график, интервал в днях: <?=$days?></h2>
	<a href="?days=1">Сутки</a> |
	<a href="?days=2">Двое суток</a> |
	<a href="?days=7">Неделя</a> |
	<a href="?days=14">2 недели</a> |
	<a href="?days=31">Месяц</a> |
	<a href="?days=61">2 месяца</a> |
	<br/>
	
	<?php RenderChart("/API/1.1/heating/GetTempHistory/$days", "Температура (С)");?>

	<?php include 'include/js.php';?>
</body>
</html>