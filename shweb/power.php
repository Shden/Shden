<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Электроэнергия</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css"></head>
<body>
	<?php include 'menu.php';?>

	<?php
	$json = `/home/den/Shden/mercury236/mercury236 /dev/ttyUSB0 --json`;
print "<pre>$json</pre>";
	$r = json_decode($json, true);

	function VF($val) { return number_format($val, 2); }
	?>

	<div class="container" align="center">
		<h2>Данные электросчетчика</h2>
		<table border="1">
			<thead>
				<th>Параметр</th>
				<th>Фаза 1</th>
				<th>Фаза 2</th>
				<th>Фаза 3</th>
				<th>Всего</th>
			</thead>
			<tr>
				<td>Напряжение сети (В):</td>
				<td align="right"><?=VF($r["U"]["p1"])?></td>
				<td align="right"><?=VF($r["U"]["p2"])?></td>
				<td align="right"><?=VF($r["U"]["p3"])?></td>
				<td></td>
			</tr>
			<tr>
				<td>Ток потребления (А):</td>
				<td align="right"><?=VF($r["I"]["p1"])?></td>
				<td align="right"><?=VF($r["I"]["p1"])?></td>
				<td align="right"><?=VF($r["I"]["p1"])?></td>
				<td></td>
			<tr>
				<td>Коэффициент мощности (cos(f)):</td>
				<td align="right"><?=VF($r["CosF"]["p1"])?></td>
				<td align="right"><?=VF($r["CosF"]["p1"])?></td>
				<td align="right"><?=VF($r["CosF"]["p1"])?></td>
				<td align="right"><?=VF($r["CosF"]["sum"])?></td>
			</tr>
			<tr>
				<td>Частота сети (Гц):</td>
				<td></td>
				<td></td>
				<td></td>
				<td align="right"><?=VF($r["F"])?></td>
			</tr>
			<tr>
				<td>Угол сдвига фаз:</td>
				<td align="right"><?=VF($r["A"]["p1"])?></td>
				<td align="right"><?=VF($r["A"]["p1"])?></td>
				<td align="right"><?=VF($r["A"]["p1"])?></td>
				<td></td>
			</tr>
			<tr>
				<td>Текущая активная мощность (Вт):</td>
				<td align="right"><?=VF($r["P"]["p1"])?></td>
				<td align="right"><?=VF($r["P"]["p1"])?></td>
				<td align="right"><?=VF($r["P"]["p1"])?></td>
				<td align="right"><?=VF($r["P"]["sum"])?></td>
			</tr>
			<tr>
				<td>Текущая реактивная мощность (Вт):</td>
				<td align="right"><?=VF($r["S"]["p1"])?></td>
				<td align="right"><?=VF($r["S"]["p1"])?></td>
				<td align="right"><?=VF($r["S"]["p1"])?></td>
				<td align="right"><?=VF($r["S"]["sum"])?></td>
			</tr>
			<tr>
				<td>Потребление энергии, всего (кВт):</td>
				<td align="right"><?=VF($r["PR"]["p1"])?></td>
				<td align="right"><?=VF($r["PR"]["p1"])?></td>
				<td align="right"><?=VF($r["PR"]["p1"])?></td>
				<td align="right"><?=VF($r["PR"]["sum"])?></td>
			</tr>
			<tr>
				<td>Потребление энергии, вчера (кВт):</td>
				<td align="right"><?=VF($r["PY"]["p1"])?></td>
				<td align="right"><?=VF($r["PY"]["p1"])?></td>
				<td align="right"><?=VF($r["PY"]["p1"])?></td>
				<td align="right"><?=VF($r["PY"]["sum"])?></td>
			</tr>
			<tr>
				<td>Потребление энергии, сегодня (кВт):</td>
				<td align="right"><?=VF($r["PT"]["p1"])?></td>
				<td align="right"><?=VF($r["PT"]["p1"])?></td>
				<td align="right"><?=VF($r["PT"]["p1"])?></td>
				<td align="right"><?=VF($r["PT"]["sum"])?></td>
			</tr>
		</table>
		<br/>
		<a href="?" class="btn btn-primary" role="button">Обновить</a>
	</div>


	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>
