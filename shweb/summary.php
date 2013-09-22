<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>

<?include 'menu.php';
require_once ('include/db.inc');

if ($_REQUEST[days] == "") $days = 7; else $days = $_REQUEST[days];
$startDate = Date("Y-m-d", strtotime("-$days days"));
$endDate = Date("Y-m-d");

$res = $conn->query("CALL SP_HEATING_CONSUMPTION('$startDate', '$endDate');");

?>
<a href="?days=7">1 week</a> |
<a href="?days=14">2 weeks</a> |
<a href="?days=21">3 weeks</a> |
<a href="?days=31">1 month</a> |
<a href="?days=62">2 month</a>
<hr>
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
</body>
</html>
