<!DOCTYPE html>
<html>
<head>
	<title>House status</title>

	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.css" />
	<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js"></script>
</head>
<body>

<div data-role="page">

	<div data-role="header">
		<h1>Status</h1>
	</div>

	<div data-role="content">
<?php include 'menu.php';
require_once ('include/db.inc');

function TF($tempVal)
{
	$strTemp = (is_null($tempVal) ? "--.--" : number_format($tempVal, 1));
	$strTemp = $strTemp . "&nbsp;&deg;C";
	if (!is_null($tempVal))
	{
		if ($tempVal > 0) $strTemp = "+" . $strTemp;
		if ($tempVal > +2) $strTemp = "<font color=green>" . $strTemp . "</font>";
		if ($tempVal < -2) $strTemp = "<font color=blue>" . $strTemp . "</font>";
	}
	return $strTemp;
}

$changeStatusTo = $_REQUEST[changeStatusTo];
if ($changeStatusTo != "") 
	$conn->query("CALL SP_CHANGE_PRESENCE($changeStatusTo);");

$res = $conn->query("CALL SP_GET_STATUS();");

$isin = 0;

if ($r = $res->fetch_assoc()) 
{
	$isin = $r["PRESENCE_ISIN"];
	$starting = $r["PRESENCE_TIME"];
}
?>
	<table>
		<tr>
			<td>Режим:</td>
			<td><h3><?=($isin) ? "Присутствие" : "Ожидание"?></h3><small>(с <?=$starting?>)</small></td>
		</tr>
		<tr>
			<td>Температура сейчас</td>
		</tr>
		<tr>
			<td>&nbsp;В доме:</td>
			<td><font size=30><?=TF($r["CUR_INT"])?></font></td>
		</tr>
		<tr>
			<td>&nbsp;На улице:</td>
			<td><font size=30><?=TF($r["CUR_EXT"])?></font></td>
		</tr>
		<tr>
			<td>Температура за 24 часа</td>
			<td><small>[min/avg/max] <a href="graph.php?days=1">Подробнее >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;В доме:</td>
			<td><?=TF($r["MIN_INT_H24"])?> / <?=TF($r["AVG_INT_H24"])?> / <?=TF($r["MAX_INT_H24"])?></td>
		</tr>
		<tr>
			<td>&nbsp;На улице:</td>
			<td><?=TF($r["MIN_EXT_H24"])?> / <?=TF($r["AVG_EXT_H24"])?> / <?=TF($r["MAX_EXT_H24"])?></td>
		</tr>
		<tr>
			<td>Температура за 30 дней</td>
			<td><small>[min/avg/max] <a href="graph.php?days=30">Подробнее >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;В доме:</td>
			<td><?=TF($r["MIN_INT_D30"])?> / <?=TF($r["AVG_INT_D30"])?> / <?=TF($r["MAX_INT_D30"])?></td>
		</tr>
		<tr>
			<td>&nbsp;На улице:</td>
			<td><?=TF($r["MIN_EXT_D30"])?> / <?=TF($r["AVG_EXT_D30"])?> / <?=TF($r["MAX_EXT_D30"])?></td>
		</tr>
	</table>
	<a href="?changeStatusTo=<?=($isin) ? 0 : 1?>" data-role="button" data-theme=<?=($isin) ? "a" : "b"?>><?=($isin) ? "В режим ожидания" : "В режим присутствия"?></a>
	</div>
</div>

</body>
</html>
