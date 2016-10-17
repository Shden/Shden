<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

  	<title>Таймер отопления</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.6.0/css/bootstrap-datepicker.css">

	<style>
	#alert {
		display: none;
	}
	</style>
</head>
<body>
	<div class="container">

    <?php include 'menu.php';?>

		<h2>Таймер отопления</h2>
		<form class="form-horizontal">
			<div class="form-group">
				<label class="col-sm-2 control-label">Состояние:</label>
			    <div class="col-sm-8">
			       <div class="checkbox">
			         <label>
			           <input type="checkbox" id="timerActive" onchange="enableContols();">Таймер активен
			         </label>
			       </div>
			     </div>
			</div>
			<div class="alert alert-warning" id="alert">
				<strong></strong>
			</div>
			<div class="form-group">
				<label class="col-sm-2 control-label" for="arrive_date">Приедем:</label>
				<div class="date col-sm-8">
					<input type="text" class="form-control" id="arrive_date"
						data-date-week-start="1" data-date-language="ru"
						data-date-autoclose="true" data-date-days-of-week-highlighted="0,6"
						data-date-format="DD, d MM yyyy"/>
				</div>
			</div>
			<div class="form-group">
				<div class="col-sm-offset-2 col-sm-8">
					<select class="form-control" id="arrive_hour"></select>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-2 control-label" for="dep_date">Уедем:</label>
				<div class="date col-sm-8">
					<input type="text" class="form-control" id="dep_date"
						data-date-week-start="1" data-date-language="ru"
						data-date-autoclose="true" data-date-days-of-week-highlighted="0,6"
						data-date-format="DD, d MM yyyy"/>
 				</div>
			</div>
			<div class="form-group">
				<div class="col-sm-offset-2 col-sm-8">
					<select class="form-control" id="dep_hour"></select>
				</div>
			</div>
			<div class="form-group">
				<div class="col-sm-offset-2 col-sm-10">
					<a class="btn btn-primary" href="javascript:updateSchedule()">Обновить настройки таймера</a>
				</div>
			</div>
		</form>
	</div>
	<div id="spinner" class="spinner">

	<?php include 'include/js.php';?>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.6.0/js/bootstrap-datepicker.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.6.0/locales/bootstrap-datepicker.ru.min.js"></script>

  	<script type="text/javascript">

		$(document).ready(function()
		{
			initForm();
			loadFormData();
		});

		function initForm()
		{
			$('#arrive_date').datepicker('setDate', new Date);
			$('#dep_date').datepicker('setDate', new Date);

			/* Dates validation handlers */
			$('#arrive_date').datepicker()
				.on('changeDate', function(ev) {
					if (ev.date.valueOf() > $('#dep_date').datepicker('getDate').valueOf()) {
						$('#alert').show().find('strong').text('Предупреждение: дата прибытия должна быть раньше даты отъезда.');
					} else {
						$('#alert').hide();
					}
				});
			$('#dep_date').datepicker()
				.on('changeDate', function(ev) {
					if (ev.date.valueOf() < $('#arrive_date').datepicker('getDate').valueOf()) {
						$('#alert').show().find('strong').text('Предупреждение: дата отъезда должна быть после даты прибытия.');
					} else {
						$('#alert').hide();
					}
				});

			for (var hour=0; hour<24; hour++)
			{
				$('#arrive_hour').append($('<option>', {
				    value: hour,
				    text: hour + ':00'
				}));
				$('#dep_hour').append($('<option>', {
				    value: hour,
				    text: hour + ':00'
				}));
			}
		}

		function loadFormData()
		{
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.getJSON(GetAPIURL("heating/GetSchedule"))
				.done(function(data) {

					refreshControls(data);

					spinner.stop();
					$('#spinner').hide();
				})
				.fail(function() {
					alert('Ошибка вызова GetSchedule.');
				});
		}

		function refreshControls(data)
		{
			$('#timerActive').prop('checked', data.active == 1);

			var arrivalDate, departureDate;

			if (data.active == 1)
			{
				var arrivalDate = new Date(data.from);
				var departureDate = new Date(data.to);
			}
			else
			{
				/* Setting default start and end dates to the next weekend (Friday to Sunday) */
		        arrivalDate = new Date();
		        while (arrivalDate.getDay() != 5)
		            arrivalDate.setDate(arrivalDate.getDate() + 1);

				var departureDate = new Date();
		        departureDate.setDate((arrivalDate.getDate() + 2));

				arrivalDate.setHours(18);
				departureDate.setHours(21);
			}

			$('#arrive_date').datepicker('setDate', arrivalDate).datepicker('update');
			$('#dep_date').datepicker('setDate', departureDate).datepicker('update');

			$('#arrive_hour').val(arrivalDate.getHours()).attr('selected', 'selected');
			$('#dep_hour').val(departureDate.getHours()).attr('selected', 'selected');

			enableContols();
		}

		function enableContols()
		{
			var active = $('#timerActive').prop('checked');

			$('#arrive_date').prop('disabled', !active);
			$('#arrive_hour').prop('disabled', !active);
			$('#dep_date').prop('disabled', !active);
			$('#dep_hour').prop('disabled', !active);
		}

		function updateSchedule()
		{
			var arr = $('#arrive_date').datepicker('getDate');
			var dep = $('#dep_date').datepicker('getDate');

			arr.setHours($('#arrive_hour').val());
			dep.setHours($('#dep_hour').val());

			var URL = ($('#timerActive').prop('checked'))
				? GetAPIURL("heating/SetSchedule/" +
					arr.getFullYear() + '/' + (arr.getMonth() + 1) + '/' + arr.getDate() + '/' + arr.getHours() + '/' +
					dep.getFullYear() + '/' + (dep.getMonth() + 1) + '/' + dep.getDate() + '/' + dep.getHours())
				: GetAPIURL("heating/ResetSchedule");

			$('#spinner').show();
			var spinner = createSpinner('spinner');

	        $.ajax({
				url: URL,
				type: 'PUT',
				dataType: 'json',
				success: function(data) {

					refreshControls(data)

					spinner.stop();
					$('#spinner').hide();
				}
			});
		}
	</script>
</body>
</html>
