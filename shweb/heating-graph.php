<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Температурный график</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
</head>
<body>

	<?php include 'menu.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 1;
	?>
	<h2>Температурный график, интервал в днях: <?=$days?></h2>
	<a href="?days=1">Сутки</a> |
	<a href="?days=2">Двое суток</a> |
	<a href="?days=7">Неделя</a> |
	<a href="?days=14">2 недели</a> |
	<a href="?days=21">3 недели</a> |
	<a href="?days=31">Месяц</a> |
	<br/>
	<img src="heating-graph.php?days=<?=$days?>"/>
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

</body>
</html>