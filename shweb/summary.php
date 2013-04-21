<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
<?include 'menu.php';
require_once ('logparser.php');

if ($_REQUEST[days] == "") $days = 7; else $days = $_REQUEST[days];

$parser = new LogParser("/home/den/Shden/shc/controller.log");
$r = $parser->GetSummaryDaily(time() - 3600 * 24 * $days, time());
?>
<a href="?days=7">1 week</a> |
<a href="?days=14">2 weeks</a> |
<a href="?days=21">3 weeks</a> |
<a href="?days=31">1 month</a> |
<a href="?days=62">2 month</a>
<hr>
<table border=1>
	<tr>
		<td>Date</td>
		<td colspan="3">Outside (avg/min/max)</td>
		<td>Average inside</td>
		<td colspan="3">Heating time, h (total/night/day)</td>
	</tr>
<?foreach ($r as $i => $value) { ?>
	<tr>
		<td><?=$i?></td>
		<td align="right"><?=number_format($r[$i]["outside"]/$r[$i]["count"], 2)?></td>
		<td align="right"><?=number_format($r[$i]["outside_min"], 1)?></td>
		<td align="right"><?=number_format($r[$i]["outside_max"], 1)?></td>
		<td align="right"><?=number_format($r[$i]["inside"]/$r[$i]["count"], 2)?></td>
		<td align="right"><?=number_format($r[$i]["total"]/60, 1)?></td>
		<td align="right"><?=number_format($r[$i]["night"]/60, 1)?></td>
		<td align="right"><?=number_format(($r[$i]["total"]-$r[$i]["night"])/60, 1)?></td>
	</tr>
<?}?>

<table>
</body>
</html>
