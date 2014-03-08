<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление освещением</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<?php include 'menu.php';

	if (isset($_REQUEST['changeStreetLight250StatusTo'])) 
	{
		$newStatus = $_REQUEST['changeStreetLight250StatusTo'];
		`echo $newStatus >> /home/den/Shden/appliances/streetLight250`;
	}
	if (isset($_REQUEST['changeStreetLight150StatusTo'])) 
	{
		$newStatus = $_REQUEST['changeStreetLight150StatusTo'];
		`echo $newStatus >> /home/den/Shden/appliances/streetLight150`;
	}
	if (isset($_REQUEST['changeBalkonLightStatusTo'])) 
	{
		$newStatus = $_REQUEST['changeBalkonLightStatusTo'];
		`echo $newStatus >> /home/den/Shden/appliances/balkonLight`;
	}

	$streetLight250Status = (int)`cat /home/den/Shden/appliances/streetLight250`;
	$streetLight150Status = (int)`cat /home/den/Shden/appliances/streetLight150`;
	$balkonLightStatus = (int)`cat /home/den/Shden/appliances/balkonLight`;
	?>

	<div class="container" align="center">
		<h2>Управление освещением</h2>
		<table>
			<tr>
				<td>
					Уличный фонарь около дороги (250W):
				</td>
				<td>
					<a href="?changeStreetLight250StatusTo=<?=($streetLight250Status == 1) ? 0 : 1?>" 
						class="btn <?=($streetLight250Status == 1) ? "btn-default" : "btn-warning"?> btn-lg" role="button">
						<?=($streetLight250Status == 1) ? "Погасить" : "Зажечь"?> 
					</a>
				</td>
			</tr>
			<tr>
				<td>
					Уличный фонарь на озеро (150W):
				</td>
				<td>
					<a href="?changeStreetLight150StatusTo=<?=($streetLight150Status == 1) ? 0 : 1?>" 
						class="btn <?=($streetLight150Status == 1) ? "btn-default" : "btn-warning"?> btn-lg" role="button">
						<?=($streetLight150Status == 1) ? "Погасить" : "Зажечь"?> 
					</a>
				</td>
			</tr>
			<tr>
				<td>
					Свет на балконе 2-го этажа:
				</td>
				<td>
					<a href="?changeBalkonLightStatusTo=<?=($balkonLightStatus == 1) ? 0 : 1?>" 
						class="btn <?=($balkonLightStatus == 1) ? "btn-default" : "btn-warning"?> btn-lg" role="button">
						<?=($balkonLightStatus == 1) ? "Погасить" : "Зажечь"?> 
					</a>
				</td>
			</tr>
		</table>
			
	</div>

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>
