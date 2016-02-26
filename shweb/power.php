<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Электроэнергия</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<style>
	.spinner {
	    position: fixed;
	    top: 50%;
	    left: 50%;
	    width: 80px;
	    height: 80px;
	    margin-top: -40px; /*set to a negative number 1/2 of your height*/
	    margin-left: -40px; /*set to a negative number 1/2 of your width*/
	    border: 1px solid #ccc;
		border-radius: 8px;
	    background-color: #f3f3f3;
		display: none;
	}
	.datatable {
		width: 70%;
        border-collapse: collapse;
        border: 2px solid black;
	}

	.datatable th {
		text-align: right;
		border: 1px solid black;
		padding: 2px;
		background-color: #c0c0c0;
	}
	
	.datatable td {
		text-align: right;
		border: 1px solid black;
		padding: 2px;
	}
	
	.datatable .first {
		text-align: left;
	}
	
	</style>
	
	<?php include 'menu.php';?>

	<div class="container" align="center">
		<h2>Электросеть</h2>
		<h3>Мгновенные значения:</h3>
		<table class="datatable">
			<thead>
				<th class="first">Параметр</th>
				<th>Фаза 1</th>
				<th>Фаза 2</th>
				<th>Фаза 3</th>
				<th>Всего</th>
			</thead>
			<tr>
				<td class="first">Напряжение сети (В):</td>
				<td id="U-p1"/>
				<td id="U-p2"/>
				<td id="U-p3"/>
				<td></td>
			</tr>
			<tr>
				<td  class="first">Ток потребления (А):</td>
				<td id="I-p1"/>
				<td id="I-p2"/>
				<td id="I-p3"/>
				<td></td>
			<tr>
				<td class="first">Коэффициент мощности (cos(f)):</td>
				<td id="CosF-p1"/>
				<td id="CosF-p2"/>
				<td id="CosF-p3"/>
				<td id="CosF-sum"/>
			</tr>
			<tr>
				<td class="first">Угол сдвига фаз:</td>
				<td id="A-p1"/>
				<td id="A-p2"/>
				<td id="A-p3"/>
				<td></td>
			</tr>
			<tr>
				<td class="first">Текущая активная мощность (Вт):</td>
				<td id="P-p1"/>
				<td id="P-p2"/>
				<td id="P-p3"/>
				<td id="P-sum"/>
			</tr>
			<tr>
				<td class="first">Текущая реактивная мощность (Вт):</td>
				<td id="S-p1"/>
				<td id="S-p2"/>
				<td id="S-p3"/>
				<td id="S-sum"/>
			</tr>
			<tr>
				<td class="first">Частота сети (Гц):</td>
				<td colspan="4" id="F"/>
			</tr>
		</table>
		<br/>
		<h3>Накопленные значения:</h3>
		<table class="datatable">
			<thead>
				<th class="first">Потребление энергии</th>
				<th>Значение по счетчику</th>
				<th>Накопленное значение</th>
			</thead>
			<tr>
				<td class="first">Всего:</td>
				<td><span id="PR-ap">...</span>&nbsp;кВт</td>
				<td><span id="PR-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td class="first">&nbsp;&nbsp;из них по дневному тарифу:</td>
				<td><span id="PR-day-ap">...</span>&nbsp;кВт</td>
				<td><span id="PR-day-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td class="first">&nbsp;&nbsp;из них по ночному тарифу:</td>
				<td><span id="PR-night-ap">...</span>&nbsp;кВт</td>
				<td><span id="PR-night-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td class="first">Вчера:</td>
				<td><span id="PY-ap">...</span>&nbsp;кВт</td>
				<td></td>
			</tr>
			<tr>
				<td class="first">Сегодня:</td>
				<td><span id="PT-ap">...</span>&nbsp;кВт</td>
				<td></td>
			</tr>
		</table>
		<br/>
		<a href="javascript:refreshForm();" class="btn btn-primary" role="button">Обновить</a>
		<div id="spinner" class="spinner">
	</div>

	<?php include 'include/js.php';?>
	
	<script src="//fgnass.github.io/spin.js/spin.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js"></script>
	
	<script>
		$(document).ready(function() {
			refreshForm();
		});
		
		function refreshForm()
		{
			$('#spinner').show();

			var opts = {
				  lines: 13 // The number of lines to draw
				, length: 10 // The length of each line
				, width: 4 // The line thickness
				, radius: 12 // The radius of the inner circle
				, scale: 1 // Scales overall size of the spinner
				, corners: 1 // Corner roundness (0..1)
				, color: '#000' // #rgb or #rrggbb or array of colors
				, opacity: 0.25 // Opacity of the lines
				, rotate: 0 // The rotation offset
				, direction: 1 // 1: clockwise, -1: counterclockwise
				, speed: 1 // Rounds per second
				, trail: 60 // Afterglow percentage
				, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
				, zIndex: 2e9 // The z-index (defaults to 2000000000)
				, className: 'spinner-css' // The CSS class to assign to the spinner
				, top: '50%' // Top position relative to parent
				, left: '50%' // Left position relative to parent
				, shadow: false // Whether to render a shadow
				, hwaccel: false // Whether to use hardware acceleration
				, position: 'absolute' // Element positioning
			};
			var target = document.getElementById('spinner');
			var spinner = new Spinner(opts).spin(target);

			var API = "/API/1.1/consumption/electricity/GetPowerMeterData";
			$.getJSON(API)
				.done(function(data) {

					refreshValue('U', 'p1', data);
					refreshValue('U', 'p2', data);
					refreshValue('U', 'p3', data);

					refreshValue('I', 'p1', data);
					refreshValue('I', 'p2', data);
					refreshValue('I', 'p3', data);

					refreshValue('CosF', 'p1', data);
					refreshValue('CosF', 'p2', data);
					refreshValue('CosF', 'p3', data);
					refreshValue('CosF', 'sum', data);

					refreshValue('A', 'p1', data);
					refreshValue('A', 'p2', data);
					refreshValue('A', 'p3', data);

					refreshValue('P', 'p1', data);
					refreshValue('P', 'p2', data);
					refreshValue('P', 'p3', data);
					refreshValue('P', 'sum', data);

					refreshValue('S', 'p1', data);
					refreshValue('S', 'p2', data);
					refreshValue('S', 'p3', data);
					refreshValue('S', 'sum', data);
					
					refreshValue1('F', data);

					refreshValue('PR', 'ap', data);
					refreshValue('PR-day', 'ap', data);
					refreshValue('PR-night', 'ap', data);
					
					refreshValue('PR', 'ap2', data);
					refreshValue('PR-day', 'ap2', data);
					refreshValue('PR-night', 'ap2', data);
					
					refreshValue('PY', 'ap', data);
					refreshValue('PT', 'ap', data);
					
					spinner.stop();
					$('#spinner').hide();
					
			    });			
		}
		
		function refreshValue(selector1, selector2, data)
		{
			$('#' + selector1 + '-' + selector2).html(numeral(data[selector1][selector2]).format('0,0.00'));
		}

		function refreshValue1(selector, data)
		{
			$('#' + selector).html(numeral(data[selector]).format('0,0.00'));
		}
	</script>
	
</body>
</html>
