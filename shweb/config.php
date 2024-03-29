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

	<body>
		<div class="container">
			<?php
				include 'menu.php';
				include 'include/js.php';
				?>

			<br/>
			<div class="container col-sm-8">
				<form>
					<h2>Настройка теплых полов</h2>
					<table>
						<tr>
							<th></th>
							<th>Присутствие</th>
							<th>Краткосрочное ожидание</th>
							<th>Долгосрочное ожидание</th>
						</tr>
						<tr>
							<td>Теплый пол в сауне:</td>
							<td>
								<div class="input-group">
									<input type="text" class="form-control"
										id="saunaFloorTemp"
										format="0.0"
										style="text-align:right;"/>
									<div class="input-group-append">
										<span class="input-group-text" id="basic-addon2">&deg;С</span>
									</div>
								</div>
								<label class="control-label col-sm-3" id="saunaFloorTempAlert">
									<strong></strong>
								</label>
							</td>
							<td>
								<div class="input-group">
									<input type="text" class="form-control"
										id="saunaFloorTempShortStandBy"
										format="0.0"
										style="text-align:right;"/>
									<div class="input-group-append">
										<span class="input-group-text" id="basic-addon2">&deg;С</span>
									</div>
								</div>
								<label class="control-label col-sm-3" id="saunaFloorTempShortStandByAlert">
									<strong></strong>
								</label>
							</td>
							<td>
								<div class="input-group">
									<input type="text" class="form-control"
										id="saunaFloorTempLongStandBy"
										format="0.0"
										style="text-align:right;"/>
									<div class="input-group-append">
										<span class="input-group-text" id="basic-addon2">&deg;С</span>
									</div>
								</div>
								<label class="control-label col-sm-3" id="saunaFloorTempLongStandByAlert">
									<strong></strong>
								</label>
							</td>
						</tr>
					</table>

					<div class="form-group row">
						<label class="col-sm-6 control-label" for="house1FloorTemp">
							Температура теплых полов в холле первого этажа:</label>
						<div class="input-group col-sm-2">
							<input type="text" class="form-control"
								id="house1FloorTemp"
								format="0.0"
								style="text-align:right;"/>
							<div class="input-group-append">
								<span class="input-group-text" id="basic-addon2">&deg;С</span>
							</div>
						</div>
						<label class="control-label col-sm-3" id="house1FloorTempAlert">
							<strong></strong>
						</label>
					</div>
					<div class="form-group row">
						<label class="col-sm-6 control-label">
							Холл, двойной регулятор (1370 + 1095 Вт):</label>
						<div class="input-group col-sm-2">
							<a class="btn btn-outline-secondary btn-block btn-sm" href="http://192.168.1.120/config">настроить >></a>
						</div>
					</div>
					<div class="form-group row">
						<label class="col-sm-6 control-label">
							Холл, одиночный регулятор (400 Вт):</label>
						<div class="input-group col-sm-2">
							<a class="btn btn-outline-secondary btn-block btn-sm" href="http://192.168.1.121/config">настроить >></a>
						</div>
					</div>

					<div class="form-group row">
						<div class="col-sm-offset-6 col-sm-10">
							<a class="btn btn-primary"
								href="javascript:updateConfiguration()">
								Сохранить настройки</a>
						</div>
					</div>
					<h3>Configuration JSON:</h3>
					<div class="form-group">
						<div class="col-sm-offset-1 col-sm-9">
						<pre id="json"></pre>
					</div>
					</div>
				</form>
			</div>

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

				if (configuration.heating === undefined)
					configuration['heating'] = new Object();

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
