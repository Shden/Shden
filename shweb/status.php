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

$changeStatusTo = $_REQUEST[changeStatusTo];
if ($changeStatusTo != "") 
	$conn->query("CALL SP_CHANGE_PRESENCE($changeStatusTo);");

$res = $conn->query("CALL SP_GET_PRESENCE();");

$isin = 0;

if ($r = $res->fetch_assoc()) 
{
	$isin = $r["isin"];
	$starting = $r["time"];
}
?>
	<h1>Current status:</h1>
	<table>
		<tr>
			<td>Status:</td>
			<td><?=($isin) ? "Presence" : "Standby"?></td>
		</tr>
		<tr>
			<td>Last changed:</td>
			<td><?=$starting?></td>
		</tr>
	</table>
	<a href="?changeStatusTo=<?=($isin) ? 0 : 1?>" data-role="button" data-theme=<?=($isin) ? "a" : "b"?>><?=($isin) ? "To Standby" : "To Presence"?></a>
	</div>
</div>

</body>
</html>
