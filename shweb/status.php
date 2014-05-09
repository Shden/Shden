<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>House status</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
	
	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>


<?php include 'menu.php';
require_once ('include/db.inc');

function TF($tempVal)
{
	$strTemp = (is_null($tempVal) ? "--.--" : number_format($tempVal, 1));
	$strTemp = $strTemp . "&nbsp;&deg;C";
	if (!is_null($tempVal))
	{
		if ($tempVal > 0) $strTemp = "+" . $strTemp;
		if ($tempVal > +2.0) $strTemp = "<font color=green>" . $strTemp . "</font>";
		if ($tempVal < -2.0) $strTemp = "<font color=blue>" . $strTemp . "</font>";
	}
	return $strTemp;
}

if (isset($_REQUEST['changeStatusTo'])) 
{	
	$changeStatusTo = $_REQUEST['changeStatusTo'];
	$conn->query("CALL SP_CHANGE_PRESENCE($changeStatusTo);");
}

$res = $conn->query("CALL SP_GET_STATUS();");

$isin = 0;

if ($r = $res->fetch_assoc()) 
{
	$isin = $r["PRESENCE_ISIN"];
	$starting = $r["PRESENCE_TIME"];
}
?>
<div class="jumbotron">
	<div class="container" align="center">
		<h1>Режим <?=($isin) ? "присутствия" : "ожидания"?></h1>
		<p>В доме: <font size="30"><?=TF($r["CUR_INT"])?></font> На&nbsp;улице:&nbsp;<font size="30"><?=TF($r["CUR_EXT"])?></font></p>
		<a href="?changeStatusTo=<?=($isin) ? 0 : 1?>" class="btn <?=($isin) ? "btn-primary" : "btn-danger"?> btn-lg" role="button">
			В режим <?=($isin) ? "ожидания" : "присутствия"?>
		</a>
	</div>
</div>
<div class="row" align="center">
  	<div class="col-md-6" align=center>
	<table>
		<tr>
			<td><b>24 часа:</b></td>
			<td><small>[min/avg/max] <a href="heating.php?days=1">Подробнее >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;в доме</td>
			<td><?=TF($r["MIN_INT_H24"])?>/<?=TF($r["AVG_INT_H24"])?>/<?=TF($r["MAX_INT_H24"])?></td>
		</tr>
		<tr>
			<td>&nbsp;на улице</td>
			<td><?=TF($r["MIN_EXT_H24"])?>/<?=TF($r["AVG_EXT_H24"])?>/<?=TF($r["MAX_EXT_H24"])?></td>
		</tr>
	</table>
	</div>
  	<div class="col-md-6" align="center">
	<table>
		<tr>
			<td><b>30 дней:</b></td>
			<td><small>[min/avg/max] <a href="heating.php?days=30">Подробнее >></a></small></td>
		</tr>
		<tr>
			<td>&nbsp;в доме</td>
			<td><?=TF($r["MIN_INT_D30"])?>/<?=TF($r["AVG_INT_D30"])?>/<?=TF($r["MAX_INT_D30"])?></td>
		</tr>
		<tr>
			<td>&nbsp;на улице</td>
			<td><?=TF($r["MIN_EXT_D30"])?>/<?=TF($r["AVG_EXT_D30"])?>/<?=TF($r["MAX_EXT_D30"])?></td>
		</tr>
	</table>
</div>
</div>

<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="https://code.jquery.com/jquery.js"></script>
<!-- Latest compiled and minified JavaScript -->
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>
