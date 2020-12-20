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

		RenderChartWithIntervals(
			'Температурный график, интервал в днях:',
			'climate/GetTempHistory/',
			'{
				bindto: "#chart",
				data: {
					xFormat: "%Y-%m-%d %H:%M:%S",
					keys: {
						x: "date",
						value: [
							"inTemp", "outTemp", "heaterIn", "heaterOut", 
							"saunaFloor", "bedroom", "kitchen",
							"hall_floor_1", "hall_floor_2", "hall_floor_3" 
							]
					},
					type: "spline",
					names: {
						inTemp: "температура в доме",
						outTemp: "температура на улице",
						heaterIn: "t вход котла",
						heaterOut: "t выход котла",
						saunaFloor: "t пол в сауне",
						bedroom: "наша спальня",
						kitchen: "кухня",
						hall_floor_1: "пол в холле сегмент 1",
						hall_floor_2: "пол в холле сегмент 2",
						hall_floor_3: "пол в холле сегмент 3"
					},
					hide: [
						"heaterIn", "heaterOut", "saunaFloor", 
						"hall_floor_1", "hall_floor_2", "hall_floor_3" 
						]
				},
				zoom: {
					enabled: true
				},
				grid: {
					x: {
						show: true
					},
					y: {
						show: true,
						lines: [
							{ value: 0 },
							{ value: 2 },
							{ value: 7 },
							{ value: 22.0 },
						]
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
						label: "Температура"
					}
				},
				tooltip: {
					show: true,
					format: {
						value: function (value, ratio, id, index) { 
							return numeral(value).format("0.0") + " &deg;C"; 
						}
					}
				}
			}');
		?>
	</div>
</body>
</html>
