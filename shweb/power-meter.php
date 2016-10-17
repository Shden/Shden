<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Данные электросчетчика</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutsom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<style>
		.table {
			width: 70%;
		}

		.table th {
			text-align: right;
		}

		.table td {
			text-align: right;
		}

		.table .first {
			text-align: left;
		}
	</style>

	<div class="container">
		<?php include 'menu.php';?>

		<div class="container" align="center">
			<h2>Данные электросчетчика</h2>
			<h3>Мгновенные значения:</h3>
			<table class="table table-striped table-condensed">
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
			<table class="table table-striped table-condensed">
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
	</div>

	<?php include 'include/js.php';?>

	<script>
		$(document).ready(function() {
			refreshForm();
		});

		function refreshForm()
		{
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.getJSON(GetAPIURL("consumption/electricity/GetPowerMeterData"))
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
