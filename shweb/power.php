<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Электроэнергия</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<?php include 'menu.php';?>

	<?php
	$json = `/home/den/Shden/mercury236/mercury236 /dev/ttyUSB0 --json`;
	$r = json_decode($json, true);
	
	function VF($val) { return number_format($val, 2); }
	?>
		
	<div class="container" align="center">
		<h2>Электросеть</h2>
		<h3>Мгновенные значения:</h3>
		<table border="1" width="100%">
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
				<td align="right"><?=VF($r["I"]["p2"])?></td>
				<td align="right"><?=VF($r["I"]["p3"])?></td>
				<td></td>
			<tr>
				<td>Коэффициент мощности (cos(f)):</td>
				<td align="right"><?=VF($r["CosF"]["p1"])?></td>
				<td align="right"><?=VF($r["CosF"]["p2"])?></td>
				<td align="right"><?=VF($r["CosF"]["p3"])?></td>
				<td align="right"><?=VF($r["CosF"]["sum"])?></td>
			</tr>
			<tr>
				<td>Угол сдвига фаз:</td>
				<td align="right"><?=VF($r["A"]["p1"])?></td>
				<td align="right"><?=VF($r["A"]["p2"])?></td>
				<td align="right"><?=VF($r["A"]["p3"])?></td>
				<td></td>
			</tr>
			<tr>
				<td>Текущая активная мощность (Вт):</td>
				<td align="right"><?=VF($r["P"]["p1"])?></td>
				<td align="right"><?=VF($r["P"]["p2"])?></td>
				<td align="right"><?=VF($r["P"]["p3"])?></td>
				<td align="right"><?=VF($r["P"]["sum"])?></td>
			</tr>
			<tr>
				<td>Текущая реактивная мощность (Вт):</td>
				<td align="right"><?=VF($r["S"]["p1"])?></td>
				<td align="right"><?=VF($r["S"]["p2"])?></td>
				<td align="right"><?=VF($r["S"]["p3"])?></td>
				<td align="right"><?=VF($r["S"]["sum"])?></td>
			</tr>
			<tr>
				<td>Частота сети (Гц):</td>
				<td align="right" colspan="4"><?=VF($r["F"])?></td>
			</tr>
		</table>
		<br/>
		<h3>Накопленные значения:</h3>
		<table border="1" width="100%">
			<thead>
				<th>Потребление</th>
				<th>Значение</th>
			</thead>
			<tr>
				<td>Потребление энергии, всего:</td>
				<td align="right"><?=VF($r["PR"]["ap"])?>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>&nbsp;&nbsp;из них по дневному тарифу:</td>
				<td align="right"><?=VF($r["PR-day"]["ap"])?>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>&nbsp;&nbsp;из них по ночному тарифу:</td>
				<td align="right"><?=VF($r["PR-night"]["ap"])?>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>Потребление энергии, вчера:</td>
				<td align="right"><?=VF($r["PY"]["ap"])?>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>Потребление энергии, сегодня:</td>
				<td align="right"><?=VF($r["PT"]["ap"])?>&nbsp;кВт</td>
			</tr>
		</table>
		<br/>
		<a href="?" class="btn btn-primary" role="button">Обновить</a>
	</div>

	<?php include 'include/js.php';?>
</body>
</html>
