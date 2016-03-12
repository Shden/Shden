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
	include 'include/chart.js';
	include 'include/js.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 1;
	?>
	
	<h2>Температурный график, интервал в днях: <span id="days"></span></h2>
	<div class="btn-group" data-toggle="buttons">
		<label onclick="updateChart(1)" class="btn btn-primary active">
		  <input type="radio" name="options" id="option1" autocomplete="off" checked>Сутки
		</label>
		<label onclick="updateChart(2)" class="btn btn-primary">
		  <input type="radio" name="options" id="option2" autocomplete="off">Двое суток
		</label>
		<label onclick="updateChart(7)" class="btn btn-primary">
		  <input type="radio" name="options" id="option3" autocomplete="off">Неделя
		</label>
		<label onclick="updateChart(14)" class="btn btn-primary">
		  <input type="radio" name="options" id="option3" autocomplete="off">2 недели
		</label>
		<label onclick="updateChart(31)" class="btn btn-primary">
		  <input type="radio" name="options" id="option3" autocomplete="off">Месяц
		</label>
	</div>

	<div id="spinner" class="spinner">
	
<script>
	$(document).ready(function() {
		updateChart(<?=$days?>);
	});
	
	function updateChart(days)
	{
		$('#days').html(days);
		DisplayChart(GetAPIURL('heating/GetTempHistory/' + days), 'Температура (С)');
	}
</script>
</body>
</html>