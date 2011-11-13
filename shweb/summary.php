<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
<?include 'menu.php';
require_once ('logparser.php');

$parser = new LogParser("/home/den/shc/controller.log");
$r = $parser->GetSummaryDaily(time() - 3600*24*30, time());
?>
<table border=1>
	<tr>
		<td>Date</td>
		<td>Average outside</td>
		<td>Average inside</td>
		<td>Total, h</td>
		<td>Night, h</td>
		<td>Day, h</td>
	</tr>
<?foreach ($r as $i => $value) { ?>
	<tr>
		<td><?=$i?></td>
		<td align="right"><?=number_format($r[$i]["outside"]/$r[$i]["count"], 2)?></td>
		<td align="right"><?=number_format($r[$i]["inside"]/$r[$i]["count"], 2)?></td>
		<td align="right"><?=number_format($r[$i]["total"]/60, 1)?></td>
		<td align="right"><?=number_format($r[$i]["night"]/60, 1)?></td>
		<td align="right"><?=number_format(($r[$i]["total"]-$r[$i]["night"])/60, 1)?></td>
	</tr>
<?}?>

<table>
</body>
</html>
