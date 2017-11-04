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
					xFormat: "%Y-%m-%dT%H:%M:%S%Z",
					keys: {
						x: "date",
						value: ["inTemp", "outTemp"]
					},
					type: "spline",
					names: {
						inTemp: "температура в доме",
						outTemp: "температура на улице",
						heaterIn: "t на входе котла",
						heaterOur: "t на выходе котла",
						saunaFloor: "t пола в сауне"
					},
					hide: ["heaterIn", "heaterOut", "saunaFloor"]
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
							{ value: 22.5 },
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
				}
			}');
		?>
	</div>
</body>
</html>
