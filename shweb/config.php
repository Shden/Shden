<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Настройки</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>

<html>
	<body>
		<div class="container">
			<?php
			include 'menu.php';
			include 'include/js.php';
			?>

			<h2>Настройки системы отопления:</h2>
			<form  class="form-horizontal">
				<div class="form-group">
					<label class="col-sm-6 control-label" for="standbyTemperature">
						Температура в режиме ожидания, день (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="standbyTemperature"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="standbyTemperatureAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="standbyNightTemperature">
						ночь (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="standbyNightTemperature"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="standbyNightTemperatureAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="presenceTemperature">
						Температура в режиме присутствия (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="presenceTemperature"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="presenceTemperatureAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="tempDelta">
						Точность поддержания температуры (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="tempDelta"
							format="0.00"/>
					</div>
					<label class="control-label col-sm-3" id="tempDeltaAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="stopPumpTempDelta">
						Помпа отключается при разнице температур по контуру менее (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="stopPumpTempDelta"
							format="0.00"/>
					</div>
					<label class="control-label col-sm-3" id="stopPumpTempDeltaAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="electricHeaterOffTemp">
						Отключаем ТЭН, если котел нагревает воду до (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="electricHeaterOffTemp"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="electricHeaterOffTempAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="saunaFloorTemp">
						Температура теплого пола в сауне (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="saunaFloorTemp"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="saunaFloorTempAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="comfortSleepStartHour">
						Режима комфортного сна, начало (часов):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="comfortSleepStartHour"
							format="0"/>
					</div>
					<label class="control-label col-sm-3" id="comfortSleepStartHourAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="comfortSleepEndHour">
						окончание (часов):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="comfortSleepEndHour"
							format="0"/>
					</div>
					<label class="control-label col-sm-3" id="comfortSleepEndHourAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<label class="col-sm-6 control-label" for="comfortSleepTargetTemperature">
						Температура в спальнях в режиме комфортного сна (&deg;С):</label>
					<div class="date col-sm-1">
						<input type="text" class="form-control"
							id="comfortSleepTargetTemperature"
							format="0.0"/>
					</div>
					<label class="control-label col-sm-3" id="comfortSleepTargetTemperatureAlert">
						<strong></strong>
					</label>
				</div>
				<div class="form-group">
					<div class="col-sm-offset-6 col-sm-10">
						<a class="btn btn-primary"
							href="javascript:updateConfiguration()">
							Сохранить настройки</a>
					</div>
				</div>
				<h3>heating.json:</h3>
				<div class="form-group">
					<div class="col-sm-offset-1 col-sm-9">
					<pre id="json"></pre>
				</div>
				</div>
			</form>


		</div>
		<div id="spinner" class="spinner"/>

		<script type="text/javascript">

			var configuration;
			const endPointURL = GetAPIURL("climate/Configuration");

			$(document).ready(function()
			{
				loadFormData();
			});

			function loadFormData()
			{
				$('#spinner').show();
				var spinner = createSpinner('spinner');

				$.getJSON(endPointURL)
					.done(function(data) {

						configuration = data;

						updateControls();

						spinner.stop();
						$('#spinner').hide();
					})
					.fail(function() {
						alert('Ошибка вызова Get Configuration.');
					});
			}

			// Configuration -> form.
			// All input controls mapped to configuration data
			// object using id as a key.
			function updateControls()
			{
				updateJSON();

				$('input[type=text]').each(function() {
					var key = $(this).attr('id');
					var fmt = $(this).attr('format');
					$(this).val(numeral(configuration.heating[key]).format(fmt));
					$(this).change(validateForm);
				});
				validateForm();
			}

			function validateForm()
			{
				const hasErrorClass = 'has-error';
				var isValid = true;
				$('input[type=text]').each(function() {
					var key = $(this).attr('id');
					var val = $(this).val();

					var input = $(this);
					var alert = $('#' + key + 'Alert');

					if (isNaN(parseFloat(val)))
					{
						$(alert).show().find('strong').text('Неверные данные (формат числа).');
						$(alert).parent().addClass(hasErrorClass);
						isValid = false;
					}
					else {
						$(alert).hide();
						$(alert).parent().removeClass(hasErrorClass);
					}
				});
				return isValid;
			}

			// Form -> configuration.
			function updateConfiguration()
			{
				if (!validateForm()) {
					alert('Невозможно сохранить форму: неверные данные.');
					return false;
				}

				$('#spinner').show();
				var spinner = createSpinner('spinner');

				$('input[type=text]').each(function() {
					var key = $(this).attr('id');
					configuration.heating[key] = parseFloat($(this).val());
				});

				updateJSON();

				$.ajax({
					url: endPointURL,
					type: 'PUT',
					contentType: 'application/json',
					data: JSON.stringify(configuration, null, 8),
					success: function(data) {
						spinner.stop();
						$('#spinner').hide();
					},
					error: function(info, err, more) {
						alert(more);
					}
				});
			}

			// Display preformatted JSON
			function updateJSON()
			{
				$('#json').text(JSON.stringify(configuration, null, 8));
			}

		</script>
	</body>
</html>
