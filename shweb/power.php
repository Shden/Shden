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
	<?php include 'menu.php';?>

	<div class="container" align="center">
		<h2>Электросеть</h2>
		<h3>Мгновенные значения:</h3>
		<table border="1" width="100%">
			<thead>
				<th>Параметр</th>
				<th>Фаза 1</th>
				<th>Фаза 2</th>
				<th>Фаза 3</th>
				<th>Всего</th>
			</thead>
			<tr>
				<td>Напряжение сети (В):</td>
				<td align="right" id="U-p1"/>
				<td align="right" id="U-p2"/>
				<td align="right" id="U-p3"/>
				<td></td>
			</tr>
			<tr>
				<td>Ток потребления (А):</td>
				<td align="right" id="I-p1"/>
				<td align="right" id="I-p2"/>
				<td align="right" id="I-p3"/>
				<td></td>
			<tr>
				<td>Коэффициент мощности (cos(f)):</td>
				<td align="right" id="CosF-p1"/>
				<td align="right" id="CosF-p2"/>
				<td align="right" id="CosF-p3"/>
				<td align="right" id="CosF-sum"/>
			</tr>
			<tr>
				<td>Угол сдвига фаз:</td>
				<td align="right" id="A-p1"/>
				<td align="right" id="A-p2"/>
				<td align="right" id="A-p3"/>
				<td></td>
			</tr>
			<tr>
				<td>Текущая активная мощность (Вт):</td>
				<td align="right" id="P-p1"/>
				<td align="right" id="P-p2"/>
				<td align="right" id="P-p3"/>
				<td align="right" id="P-sum"/>
			</tr>
			<tr>
				<td>Текущая реактивная мощность (Вт):</td>
				<td align="right" id="S-p1"/>
				<td align="right" id="S-p2"/>
				<td align="right" id="S-p3"/>
				<td align="right" id="S-sum"/>
			</tr>
			<tr>
				<td>Частота сети (Гц):</td>
				<td align="right" colspan="4" id="F"/>
			</tr>
		</table>
		<br/>
		<h3>Накопленные значения:</h3>
		<table border="1" width="100%">
			<thead>
				<th>Потребление</th>
				<th>Значение по счетчику</th>
				<th>Накопленное значение</th>
			</thead>
			<tr>
				<td>Потребление энергии, всего:</td>
				<td align="right"><span id="PR-ap">...</span>&nbsp;кВт</td>
				<td align="right"><span id="PR-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>&nbsp;&nbsp;из них по дневному тарифу:</td>
				<td align="right"><span id="PR-day-ap">...</span>&nbsp;кВт</td>
				<td align="right"><span id="PR-day-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>&nbsp;&nbsp;из них по ночному тарифу:</td>
				<td align="right"><span id="PR-night-ap">...</span>&nbsp;кВт</td>
				<td align="right"><span id="PR-night-ap2">...</span>&nbsp;кВт</td>
			</tr>
			<tr>
				<td>Потребление энергии, вчера:</td>
				<td align="right"><span id="PY-ap">...</span>&nbsp;кВт</td>
				<td></td>
			</tr>
			<tr>
				<td>Потребление энергии, сегодня:</td>
				<td align="right"><span id="PT-ap">...</span>&nbsp;кВт</td>
				<td></td>
			</tr>
		</table>
		<br/>
		<a href="javascript:refreshForm();" class="btn btn-primary" role="button">Обновить</a>
	</div>

	<?php include 'include/js.php';?>
	
	<script>
		$(document).ready(function() {
			refreshForm();
		});
		
		function refreshForm()
		{
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
			    });			
		}
		
		function refreshValue(selector1, selector2, data)
		{
			$('#' + selector1 + '-' + selector2).html(data[selector1][selector2].toFixed(2));
		}

		function refreshValue1(selector, data)
		{
			$('#' + selector).html(data[selector].toFixed(2));
		}
	</script>
	
</body>
</html>
