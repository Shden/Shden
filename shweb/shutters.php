<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление роллетами</title>

	<?php include 'include/css.php';?>
	
	<!-- Shweb custom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<div class="container">
		<?php include 'menu.php';?>

		<style>
			td
			{
				padding: 4px;
			}
			td.where
			{
				text-align: right;
			}
			td.floor
			{
				text-align: left;
				font-weight: bold;
				border-bottom-width: 1px;
			}
		</style>

		<div class="container" align="center"	>

			<h2>Управление роллетами</h2>
			<table>
				<tr>
					<td class="floor" colspan="2">Первый этаж:</td>

				</tr>
					<td class="where">Гардеробная:</td>
					<td><button id="F1W1" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Кухня:</td>
					<td><button id="F1W2" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Кладовая около кухни:</td>
					<td><button id="F1W3" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Кабинет Али:</td>
					<td><button id="F1W4" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Холл:</td>
					<td>
						<button id="F1W5" class="btn">...</button>
						<button id="F1W6" class="btn">...</button>
					</td>
				</tr>
				<tr>
					<td class="where">Прихожая:</td>
					<td><button id="F1W7" class="btn">...</button></td>
				</tr>

				<tr>
					<td class="floor" colspan="2">Второй этаж:</td>
				</tr>
				<tr>
					<td class="where">Ко-ливинг:</td>
					<td><button id="F2W1" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Большая детская комната:</td>
					<td><button id="F2W2" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Сашина комната:</td>
					<td><button id="F2W3" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Холл:</td>
					<td><button id="F2W4" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Кабинет:</td>
					<td><button id="F2W5" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Маленькая детская:</td>
					<td><button id="F2W6" class="btn">...</button></td>
				</tr>
				<tr>
					<td class="where">Балкон на озеро:</td>
					<td>
						<button id="F2W7" class="btn">...</button>
						<button id="F2W8" class="btn">...</button>
						<button id="F2W9" class="btn">...</button>
					</td>
				</tr>
			</table>
			<div id="spinner" class="spinner">
		</div>
	</div>

	<?php include 'include/js.php';?>

	<script>
		$(document).ready(function() {
			refreshForm();
		});

		let endpoint = GetAPIURL("shutters/State");

		function refreshForm()
		{
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.getJSON(endpoint)
				.done(function(data) {

					refreshButtons(data);

					spinner.stop();
					$('#spinner').hide();
				});
		}

		function refreshButtons(data)
		{
			for (var floor in data)
				for (var window in data[floor])
					refreshButtonView(floor, window, data[floor][window]);
		}

		function refreshButtonView(floor, window, state)
		{
			var button = $('#' + floor + window);
			button.off('click');
			if (state == 0)
			{
				button.addClass('btn-light').removeClass('btn-dark');
				button.html('Поднять');
				button.click({ floor: floor, window: window, newStatus: 1 }, moveShutter);
			}
			else if (state == 1)
			{
				button.addClass('btn-dark').removeClass('btn-light');
				button.html('Опустить');
				button.click({ floor: floor, window: window, newStatus: 0 }, moveShutter);
			}
		}

		function moveShutter(event)
		{
			let req = { shutters: { [event.data.floor]: { [event.data.window]: event.data.newStatus }}};
			console.log(req);

			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.ajax({
				url: endpoint,
				type: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(req),
				success: function(data) {

					console.log(data);
					refreshButtons(JSON.parse(data))

					spinner.stop();
					$('#spinner').hide();
				}
			});
		}
	</script>
</body>
</html>
