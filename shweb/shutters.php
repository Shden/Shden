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
				vertical-align: middle;
			}
			th
			{
				vertical-align: middle;
			}
			td.where
			{
				text-align: right;
			}
			td.floor
			{
				font-weight: bold;
			}
			td.house
			{
				font-weight: bold;
			}
			h2
			{
				text-align: center;
			}	
		</style>

		<div class="container col-sm-6">

			<h2>Управление роллетами</h2>

			<table class="table table-striped">
				<thead class="table-primary">
					<th class="house">Дом:</th>
					<th class="house">
						<button type="button" onclick="moveAll(0);" class="btn btn-dark">Спустить все</button>
						<button type="button" onclick="moveAll(1);" class="btn btn-warning">Поднять все</button>
					</th>
				</thead>
				<thead class="table-secondary">
					<th class="floor">Первый этаж:</th>
					<th class="floor">
						<button type="button" onclick="moveFloor(1,0);" class="btn btn-dark">Спустить все</button>
						<button type="button" onclick="moveFloor(1,1);" class="btn btn-warning">Поднять все</button>
					</th>
				</thead>
				<tbody>
					<tr>
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
				</tbody>
				<thead class="table-secondary">
					<th class="floor">Второй этаж:</th>
					<th class="floor">
						<button type="button" onclick="moveFloor(2,0);" class="btn btn-dark">Спустить все</button>
						<button type="button" onclick="moveFloor(2,1);" class="btn btn-warning">Поднять все</button>
					</th>
				</thead>
				<tbody>
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
				</tbody>
				<thead class="table-secondary">
					<th class="floor">Гараж:</th>
					<th class="floor">
						<button type="button" onclick="moveFloor('garage',0);" class="btn btn-dark">Спустить все</button>
						<button type="button" onclick="moveFloor('garage',1);" class="btn btn-warning">Поднять все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td class="where">Дальнее окно:</td>
						<td><button id="GarageW1" class="btn">...</button></td>
					</tr>
					<tr>
						<td class="where">Среднее окно:</td>
						<td><button id="GarageW2" class="btn">...</button></td>
					</tr>
					<tr>
						<td class="where">Ближнее окно:</td>
						<td><button id="GarageW3" class="btn">...</button></td>
					</tr>
				</tbody>
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
                        console.log(data);
			for (var floor in data.House)
				for (var window in data.House[floor])
					refreshButtonView(floor, window, data.House[floor][window]);
		}

		function refreshButtonView(floor, window, state)
		{
			var button = $('#' + floor + window);
			button.off('click');
			if (state == 0)
			{
				button.addClass('btn-warning').removeClass('btn-dark');
				button.html('Поднять');
				button.click({ floor: floor, window: window, newStatus: 1 }, moveSingleShutter);
			}
			else if (state == 1)
			{
				button.addClass('btn-dark').removeClass('btn-warning');
				button.html('Спустить');
				button.click({ floor: floor, window: window, newStatus: 0 }, moveSingleShutter);
			}
		}

		function moveSingleShutter(event)
		{
			let req = { shutters: { [event.data.floor]: { [event.data.window]: event.data.newStatus }}};
			callAPI(req);
		}

		function moveFloor(floor, newState)
		{
			let req = { shutters: { }};
			if (floor == 1)
			{
				req.shutters.F1 = new Object();
				req.shutters.F1.W1 = newState;
				req.shutters.F1.W2 = newState;
				req.shutters.F1.W3 = newState;
				req.shutters.F1.W4 = newState;
				req.shutters.F1.W5 = newState;
				req.shutters.F1.W6 = newState;
				req.shutters.F1.W7 = newState;
			}
			if (floor == 2)
			{
				req.shutters.F2 = new Object();
				req.shutters.F2.W1 = newState;
				req.shutters.F2.W2 = newState;
				req.shutters.F2.W3 = newState;
				req.shutters.F2.W4 = newState;
				req.shutters.F2.W5 = newState;
				req.shutters.F2.W6 = newState;
				req.shutters.F2.W7 = newState;
				req.shutters.F2.W8 = newState;
				req.shutters.F2.W9 = newState;
			}
			if (floor == 'garage')
			{
				req.shutters.Garage = new Object();
				req.shutters.Garage.W1 = newState;
				req.shutters.Garage.W2 = newState;
				req.shutters.Garage.W3 = newState;
			}
			callAPI(req);
		}

		function moveAll(newState)
		{
			let req = { shutters: { F1: {}, F2: {}, Garage: {}}};

			req.shutters.F1.W1 = newState;
			req.shutters.F1.W2 = newState;
			req.shutters.F1.W3 = newState;
			req.shutters.F1.W4 = newState;
			req.shutters.F1.W5 = newState;
			req.shutters.F1.W6 = newState;
			req.shutters.F1.W7 = newState;

			req.shutters.F2.W1 = newState;
			req.shutters.F2.W2 = newState;
			req.shutters.F2.W3 = newState;
			req.shutters.F2.W4 = newState;
			req.shutters.F2.W5 = newState;
			req.shutters.F2.W6 = newState;
			req.shutters.F2.W7 = newState;
			req.shutters.F2.W8 = newState;
			req.shutters.F2.W9 = newState;

			req.shutters.Garage.W1 = newState;
			req.shutters.Garage.W2 = newState;
			req.shutters.Garage.W3 = newState;

			callAPI(req);
		}

		function callAPI(req)
		{
			console.log(req);
			
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.ajax({
				url: endpoint,
				type: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(req),
				success: function(data) {

					// console.log(data);
					refreshButtons(data);

					spinner.stop();
					$('#spinner').hide();
				}
			});
		}
	</script>
</body>
</html>
