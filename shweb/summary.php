<!DOCTYPE html>
<html>
<head>
	<title>Heating energy consumption summary</title>

	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     

	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.css" />
	<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js"></script>
</head>
<body>

<div data-role="page">

	<div data-role="header">
		<h1>Heating summary</h1>
	</div><!-- /header -->

	<div data-role="content">
<?include 'menu.php';
require_once ('include/db.inc');

if ($_REQUEST[days] == "") $days = 7; else $days = $_REQUEST[days];
$d = $days - 1;
$startDate = Date("Y-m-d", strtotime("-$d days"));
$endDate = Date("Y-m-d", strtotime("+1 days"));

$res = $conn->query("CALL SP_HEATING_CONSUMPTION('$startDate', '$endDate');");

?>
<div data-role="navbar" data-grid="d">
    <ul>
	<li> class="ui-state-persist"<a href="?days=7">1 week</a></li>
	<li><a href="?days=14">2 weeks</a></li>
	<li><a href="?days=21">3 weeks</a></li>
	<li><a href="?days=31">1 month</a></li>
	<li><a href="?days=62">2 month</a></li>
    </ul>
</div><!-- /navbar -->
<table border=1>
	<tr>
		<td>Дата</td>
		<td colspan="3">Снаружи, <sup>o</sup>C (средняя/мин/макс)</td>
		<td>Внутри, <sup>o</sup>C</td>
		<td colspan="3">Время обогрева, ч (всего/ночь/день)</td>
		<td colspan="3">Стоимость, руб (всего/ночь/день)</td>
	</tr>
<?while($r = $res->fetch_assoc()) { ?>
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
<?}?>

<table>
	</div><!-- /content -->

</div><!-- /page -->

</body>
</html>
