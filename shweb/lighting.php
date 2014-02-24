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
	
	if (isset($_REQUEST['changeStreetLightStatusTo'])) 
	{	
		$newStatus = $_REQUEST['changeStreetLightStatusTo'];
		`echo $newStatus >> /mnt/1wire/3A.B8380D000000/PIO.A`;
	}
	
	$streetLightStatus = `cat /mnt/1wire/3A.B8380D000000/PIO.A`;
	?>
	
	<div class="container" align="center">
		<h2>Управление освещением</h2>
		<a href="?changeStreetLightStatusTo=<?=($streetLightStatus = 1) ? 0 : 1?>" 
			class="btn <?=($streetLightStatus = 1) ? "btn-default" : "btn-warning"?> btn-lg" role="button">
			<?=($streetLightStatus = 1) ? "Погасить" : "Зажечь"?> уличный фонарь
		</a>
	</div>
	
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>