<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Уровень влажности</title>

	<?php include 'include/css.php';?>

	<link rel="stylesheet" href="css/chart.css">
</head>

<body>
	<div class="container">
		<?php
		include 'menu.php';
		include 'include/js.php';
		include 'include/chartHelper.php';

		RenderChartWithIntervals(
			'Уровень влажности, интервал в днях:',
			'climate/GetHumidityHistory/',
			'{
				bindto: "#chart",
				data: {
					xFormat: "%Y-%m-%d %H:%M:%S",
					keys: {
						x: "date",
						value: ["bathroom"]
					},
					type: "spline",
					names: {
						bathroom: "влажность в сауне"
					}
				},
				grid: {
					x: {
						show: true
					},
					y: {
						show: true
					}
				},
				axis: {
					x: {
						type: "timeseries",
						tick: {
							culling: {
								max: 6 // the number of tick texts will be adjusted to less than this value
							},
							format: "%d %b %H:%M" // Jan 19 20:40
						},
						label: "Время"
					},
					y: {
						label: "Влажность"
					}
				}
			}');
		?>
	</div>
</body>
</html>
