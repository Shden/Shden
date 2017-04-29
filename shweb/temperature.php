<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Температурный график</title>

	<?php include 'include/css.php';?>

	<link rel="stylesheet" href="css/chart.css">
</head>

<body>
	<div class="container">
		<?php
		include 'menu.php';
		include 'include/js.php';
		include 'include/chartHelper.php';

		RenderChartWithIntervals("Температурный график, интервал в днях:", "Температура (С)", "climate/GetTempHistory/");
		?>
	</div>
</body>
</html>
