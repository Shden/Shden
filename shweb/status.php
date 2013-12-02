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
<?include 'menu.php';
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
	<h3>Current status:</h3>
	<table>
		<tr>
			<td>House mode:</td>
			<td><?=($isin) ? "Presence" : "Standby"?></td>
		</tr>
		<tr>
			<td>Last changed:</td>
			<td><?=$starting?></td>
		</tr>
		<tr>
			<td>Current temperature:</td>
		</tr>
		<tr>
			<td>&nbsp;Inside:</td>
			<td><font size=30><?=TF($r["CUR_INT"])?></font></td>
		</tr>
		<tr>
			<td>&nbsp;Outside:</td>
			<td><font size=30><?=TF($r["CUR_EXT"])?></font></td>
		</tr>
		<tr>
			<td>24 hours temperature summary:</td>
			<td><small>[min/avg/max] <a href="graph.php?days=1">See details >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;Inside:</td>
			<td><?=TF($r["MIN_INT_H24"])?> / <?=TF($r["AVG_INT_H24"])?> / <?=TF($r["MAX_INT_H24"])?></td>
		</tr>
		<tr>
			<td>&nbsp;Outside:</td>
			<td><?=TF($r["MIN_EXT_H24"])?> / <?=TF($r["AVG_EXT_H24"])?> / <?=TF($r["MAX_EXT_H24"])?></td>
		</tr>
		<tr>
			<td>30 days temperature summary:</td>
			<td><small>[min/avg/max] <a href="graph.php?days=30">See details >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;Inside:</td>
			<td><?=TF($r["MIN_INT_D30"])?> / <?=TF($r["AVG_INT_D30"])?> / <?=TF($r["MAX_INT_D30"])?></td>
		</tr>
		<tr>
			<td>&nbsp;Outside:</td>
			<td><?=TF($r["MIN_EXT_D30"])?> / <?=TF($r["AVG_EXT_D30"])?> / <?=TF($r["MAX_EXT_D30"])?></td>
		</tr>
	</table>
	<a href="?changeStatusTo=<?=($isin) ? 0 : 1?>" data-role="button" data-theme=<?=($isin) ? "a" : "b"?>><?=($isin) ? "To Standby" : "To Presence"?></a>
	</div>
</div>

</body>
</html>
