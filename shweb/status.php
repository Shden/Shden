<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>House status</title>

	<?php
	include 'include/css.php';
	include 'include/js.php';
	?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">

	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.18/c3.css" integrity="sha256-4RzAUGJSSgMc9TaVEml6THMrB96T28MR6/2FJ3RCHBQ=" crossorigin="anonymous" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.18/c3.js" integrity="sha256-8Roi9vOs6/KPNbW4O/JoZZoNFI/iM36Ekn0sklwEZa0=" crossorigin="anonymous"></script>
</head>
<body>

<style>
	.temp-big
	{
		font-size: 48px;
	}

	.temp-warm
	{
		color: green;
	}

	.temp-cold
	{
		color: blue;
	}
	.mains-on
	{
		font-size: 24px;
		color: green;
	}
	.mains-off
	{
		font-size: 24px;
		color: red;
	}
	.power-val
	{
		font-size: 24px;
		color: black;
	}
	.status-val
	{
		font-size: 36px;
		font-weight: normal;
	}
</style>

<div class="container">
	<?php
	include 'menu.php';
	?>

	<div class="container" align="center">
		<div class="page-header">
			<h1>
				Режим:
				<span id="statusHdr" class="status-val">---</span>
				<a role="button" class="btn btn-default" href="javascript:updateForm();">
					<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
				</a>
			</h1>
			<h2>
				Электропитание: <span id="mains">----</span>
			</h2>
			<a id="modeBtn" class="btn btn-lg" role="button"></a>
		</div>
		<div class="page-header">
			Расход сегодня: <span id="power_today" class="power-val">--</span>
			<div id="chart" />
		</div>
		<div>
			<br/>
			<a id="modeBtn" class="btn btn-lg btn-warning" role="button" href="javascript:Kettle();">Чайник!</a>
		</div>
		<div class="page-header">
			В доме: <span id="inside" class="temp-big">--.--</span>
			На улице: <span id="outside" class="temp-big">--.--</span>
		</div>
		<div>
			<div class="col-md-6">
				<table>
					<tr>
						<td><b>24 часа:</b></td>
						<td><small>[min/avg/max] <a href="temperature.php?days=1">Подробнее >></a></small></td>
					</tr>
					<tr>
						<td>&nbsp;в доме</td>
						<td><span id="MIN_INT_H24"></span>/<span id="AVG_INT_H24"></span>/<span id="MAX_INT_H24"></span></td>
					</tr>
					<tr>
						<td>&nbsp;на улице</td>
						<td><span id="MIN_EXT_H24"></span>/<span id="AVG_EXT_H24"></span>/<span id="MAX_EXT_H24"></span></td>
					</tr>
				</table>
			</div>
			<div class="col-md-6">
				<table>
					<tr>
						<td><b>30 дней:</b></td>
						<td><small>[min/avg/max] <a href="temperature.php?days=30">Подробнее >></a></small></td>
					</tr>
					<tr>
						<td>&nbsp;в доме</td>
						<td><span id="MIN_INT_D30"></span>/<span id="AVG_INT_D30"></span>/<span id="MAX_INT_D30"></span></td>
					</tr>
					<tr>
						<td>&nbsp;на улице</td>
						<td><span id="MIN_EXT_D30"></span>/<span id="AVG_EXT_D30"></span>/<span id="MAX_EXT_D30"></span></td>
					</tr>
				</table>
			</div>
		</div>
	</div>
	<div id="spinner" class="spinner"/>
</div>

<script>
	$(document).ready(function() {
		updateForm();
	});

	function updateForm()
	{
		$('#spinner').show();
		var spinner = createSpinner('spinner');

		$.getJSON(GetAPIURL("status/GetHouseStatus"))
			.done(function(data) {

				refreshControls(data);

				spinner.stop();
				$('#spinner').hide();
			})
			.fail(function(err) {
				alert('Ошибка вызова GetHouseStatus.');
			});
	}

	function refreshControls(data)
	{
		formatTemp($('#inside'), data.climate.inTemp);
		formatTemp($('#outside'), data.climate.outTemp);

		var mainsGlyphon = $('#mains');
		if (data.mode.mains == 1)
		{
			mainsGlyphon
				.addClass('mains-on')
				.removeClass('mains-off')
				.html('Вкл.');
		}
		else
		{
			mainsGlyphon
				.addClass('mains-off')
				.removeClass('mains-on')
				.html('Выкл.');
		}

		var power_now = $('#power_now');
		var power_today = $('#power_today');

		power_today.html(numeral(data.power.PT.ap).format('0.0') + ' кВт/ч');
		renderPowerGauge(data.power.S.sum/1000);

		formatTemp($('#MIN_INT_H24'), data.tempStat.day.inside.min);
		formatTemp($('#AVG_INT_H24'), data.tempStat.day.inside.avg);
		formatTemp($('#MAX_INT_H24'), data.tempStat.day.inside.max);

		formatTemp($('#MIN_EXT_H24'), data.tempStat.day.outside.min);
		formatTemp($('#AVG_EXT_H24'), data.tempStat.day.outside.avg);
		formatTemp($('#MAX_EXT_H24'), data.tempStat.day.outside.max);

		formatTemp($('#MIN_INT_D30'), data.tempStat.month.inside.min);
		formatTemp($('#AVG_INT_D30'), data.tempStat.month.inside.avg);
		formatTemp($('#MAX_INT_D30'), data.tempStat.month.inside.max);

		formatTemp($('#MIN_EXT_D30'), data.tempStat.month.outside.min);
		formatTemp($('#AVG_EXT_D30'), data.tempStat.month.outside.avg);
		formatTemp($('#MAX_EXT_D30'), data.tempStat.month.outside.max);

		var modeBtn = $('#modeBtn');
		var statusHdr = $('#statusHdr');
		var statusAlert = $('#statusAlert');

		if (data.mode.presence == 1) {
			statusHdr.html('Присутствие');
			modeBtn.html('В режим ожидания');
			modeBtn.addClass('btn-primary').removeClass('btn-danger');
			modeBtn.attr('href', 'javascript:SetHouseMode(0)');
		}
		else if (data.mode.presence == 0) {
			statusHdr.html('Ожидание');
			modeBtn.html('В режим присутствия');
			modeBtn.addClass('btn-danger').removeClass('btn-primary');
			modeBtn.attr('href', 'javascript:SetHouseMode(1)');
		}
	}

	function renderPowerGauge(powerConsumption)
	{
		var chart = c3.generate({
			data: {
				columns: [
					['data', powerConsumption]
				],
				type: 'gauge'
			},
			gauge: {
				label: {
					format: function(value, ratio) {
						return numeral(value).format('0.00') + ' кВт';
					},
					show: true // to turn off the min/max labels.
				},
				min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
				max: 20, // 100 is default
				units: 'Нагрузка',
			//    width: 39 // for adjusting arc thickness
			},
			color: {
				pattern: [ '#60B044', '#F6C600', '#F97600', '#FF0000'], // the three color levels for the percentage values.
				threshold: {
					//            unit: 'value', // percentage is default
					//            max: 200, // 100 is default
					values: [3, 6, 9, 17]
				}
			},
			size: {
				height: 180
			}
		});
	}

	function formatTemp(control, value)
	{
		var strValue = numeral(value).format('0.0') + '&nbsp;&deg;C';
		if (value > 0) strValue = '+' + strValue;

		control.html(strValue);

		if (value > +2.0) control.addClass('temp-warm').removeClass('temp-cold');
		if (value < -2.0) control.addClass('temp-cold').removeClass('temp-warm');
	}

	function SetHouseMode(mode)
	{
		$('#spinner').show();
		var spinner = createSpinner('spinner');

		var API = GetAPIURL("status/SetHouseMode");
		$.ajax({
		    url: API + '/' + mode,
		    type: 'PUT',
			dataType: 'json',
		    success: function(data) {
				refreshControls(data);

				spinner.stop();
				$('#spinner').hide();

				if (data.mode.presence == mode)
				{
					alert('Дом переведен в режим ' + ((mode == 0) ? 'ожидания.' : 'присутствия.'));
				}
				else
				{
					alert('Ошибка: режим не изменился.');
				}
		    },
			error: function(xhr, status, error) {
				alert('Ошибка: ' + error);
			}
		});
	}

	function Kettle()
	{
		$('#spinner').show();
		var spinner = createSpinner('spinner');

		var API = GetAPIURL('consumption/electricity/DropPowerConsumption');
		$.ajax({
			url: API,
			type: 'PUT',
			dataType: 'json',
			success: function(data) {
				spinner.stop();
				$('#spinner').hide();
				updateForm();
			},
			error: function(xhr, status, error) {
				alert('Ошибка: ' + error);
			}
		});

	}
</script>
</body>
</html>
