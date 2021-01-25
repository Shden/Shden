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

	<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
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
			<div class="btn-group">
				<button id="currentMode" type="button" class="btn btn-lg"></button>
				<button id="currentModeToggle" type="button" class="btn dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
					<span class="visually-hidden">Toggle Dropdown</span>
				</button>
				<ul id="changeModeMenu" class="dropdown-menu">
					<li><a class="dropdown-item" href="#">Action</a></li>
					<li><a class="dropdown-item" href="#">Another action</a></li>
					<li><a class="dropdown-item" href="#">Something else here</a></li>
				</ul>
			</div>
			<h2>
				Электропитание: <span id="mains">----</span>
			</h2>
		</div>
		<div class="page-header">
			Расход сегодня: <span id="power_today" class="power-val">--</span>
			<div id="chart"></div>
		</div>
		<div class="page-header">
			<a href="temperature.php">В доме:</a> <span id="inside" class="temp-big">--.--</span>
			<a href="temperature.php">На улице:</a> <span id="outside" class="temp-big">--.--</span>
		</div>
	</div>
	<div id="spinner" class="spinner"></div>
</div>

<script>
	$(document).ready(function() {
		updateForm();
		setInterval(updateForm, 30000);
	});

	function updateForm()
	{
		$('#spinner').show();
		var spinner = createSpinner('spinner');

		$.getJSON(GetAPIURL("status/HouseStatus"))
			.done(function(data) {

				refreshControls(data);

				spinner.stop();
				$('#spinner').hide();
			})
			.fail(function(err) {
				alert('Ошибка вызова GET HouseStatus.');
			});
	}

	function refreshControls(data)
	{
		formatTemp($('#inside'), data.oneWireStatus.temperatureSensors.bedroom);
		formatTemp($('#outside'), data.oneWireStatus.temperatureSensors.outsideTemp);

		var mainsGlyphon = $('#mains');
		if (data.oneWireStatus.switches.mainsSwitch == 1)
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

		if ('PT' in data.powerStatus && 'S' in data.powerStatus)
		{
			power_today.html(numeral(data.powerStatus.PT.ap).format('0.0') + ' кВт/ч');
			renderPowerGauge(data.powerStatus.S.sum/1000);
		}

		let modeMenu = {
			'1' : {
				name: 'Режим присутствия',
				transitionName: 'Перевести в режим присутствия',
				class: 'btn-success'
			},
			'0' : {
				name: 'Режим долгосрочного ожидания',
				transitionName: 'Перевести в режим <b>долгосрочного</b> ожидания',
				class: 'btn-danger'
			},
			'2' : {
				name: 'Режим краткосрочного ожидания',
				transitionName: 'Перевести в режим <b>краткосрочного</b> ожидания',
				class: 'btn-warning'
			}			
		};

		let currentMode = $('#currentMode');
		let currentModeToggle = $('#currentModeToggle');
		let mode = data.config.modeId;

		// -- current mode display
		currentMode.html(modeMenu[mode].name);
		currentMode.addClass(modeMenu[mode].class);
		currentModeToggle.addClass(modeMenu[mode].class);

		// -- possible mode transitions 
		$('#changeModeMenu').empty();
		for (transitionMode in modeMenu)
			if (mode != transitionMode)
			{
				$('#changeModeMenu').append(`<li><a class="dropdown-item" href="javascript:SetHouseMode(${transitionMode})">${modeMenu[transitionMode].transitionName}</a></li>`);
				currentMode.removeClass(modeMenu[transitionMode].class);
				currentModeToggle.removeClass(modeMenu[transitionMode].class);	
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
				pattern: [ '#60B044', '#F6C600', '#F97600', '#FF0000'], // color levels for the values.
				threshold: {
					//            unit: 'value', // percentage is default
					//            max: 200, // 100 is default
					values: [3, 6, 9, 12]
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

	function SetHouseMode(newMode)
	{
		if (!confirm('Меняем режим?')) return;

		$('#spinner').show();
		var spinner = createSpinner('spinner');

		$.ajax({
			url: GetAPIURL("status/HouseMode"),
			type: 'PUT',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ mode: newMode}),
			success: function(data) {
				refreshControls(data);

				spinner.stop();
				$('#spinner').hide();

				if (data.config.modeId == newMode)
				{
					alert(`Помняли режим на: ${data.config.modeDesctiption}.`);
				}
				else
				{
					alert('Ошибка: не удалось сменить режим.');
				}
			},
			error: function(xhr, status, error) {
				alert('Ошибка: ' + error);
			}
		});
	}

</script>
</body>
</html>
