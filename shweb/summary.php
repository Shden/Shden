<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Энергопотребление системы отопления</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
</head>

<?php include 'menu.php';
require_once ('include/db.inc');

$days = (isset($_REQUEST['days'])) ? $_REQUEST['days'] : 7;
$d = $days - 1;
date_default_timezone_set("Europe/Moscow");
$startDate = Date("Y-m-d", strtotime("-$d days"));
$endDate = Date("Y-m-d", strtotime("+1 days"));

$res = $conn->query("CALL SP_HEATING_CONSUMPTION('$startDate', '$endDate');");

?>
<h1>Энергопотребление системы отопления</h1>
<div class="navbar navbar-default" role="navigation">
    <ul class="nav navbar-nav">
		<li><a href="?days=7">1 неделя</a></li>
		<li><a href="?days=14">2 недели</a></li>
		<li><a href="?days=21">3 недели</a></li>
		<li><a href="?days=31">1 месяц</a></li>
		<li><a href="?days=62">2 месяца</a></li>
    </ul>
</div><!-- /navbar -->
<table border="1" width="100%">
	<thead>
		<th>Дата</th>
		<th colspan="3">Снаружи, &deg;C (средняя/мин/макс)</th>
		<th>Внутри, &deg;C</th>
		<th colspan="3">Время обогрева, ч (всего/ночь/день)</th>
		<th colspan="3">Стоимость, руб (всего/ночь/день)</th>
	</thead>
<?php while($r = $res->fetch_assoc()) { ?>
	<tr>
		<td><?=$r["Date"]?></td>
		<td align="right"><?=number_format($r["AvgOutside"], 1)?></td>
		<td align="right"><?=number_format($r["MinOutside"], 1)?></td>
		<td align="right"><?=number_format($r["MaxOutside"], 1)?></td>
		<td align="right"><?=number_format($r["Inside"], 2)?></td>
		<td align="right"><?=number_format($r["HeatingTotalTime"], 1)?></td>
		<td align="right"><?=number_format($r["HeatingNightTime"], 1)?></td>
		<td align="right"><?=number_format($r["HeatingDayTime"], 1)?></td>
		<td align="right"><?=number_format($r["TotalCost"], 2)?></td>
		<td align="right"><?=number_format($r["NightCost"], 2)?></td>
		<td align="right"><?=number_format($r["DayCost"], 2)?></td>
	</tr>
<?php }?>

</table>
<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="https://code.jquery.com/jquery.js"></script>
<!-- Latest compiled and minified JavaScript -->
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

</body>
</html>
