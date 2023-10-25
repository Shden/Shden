<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление освещением</title>

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

			<h2>Управление освещением</h2>

			<table class="table table-striped">
				<thead class="table-primary">
					<th class="house">Уличное освещение:</th>
					<th class="house">
						<button type="button" onclick="moveAll(0);" class="btn btn-secondary">Погасить все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td>Уличный фонарь около дороги (250W):</td>
						<td><button id="streetLight250" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Уличный фонарь на озеро (150W):</td>
						<td><button id="streetLight150" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Подсветка забора и парковки:</td>
						<td><button id="fenceLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Крыльцо, верхний свет:</td>
						<td><button id="porchOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
				</tbody>
				<thead class="table-primary">
					<th class="house">Дом:</th>
					<th class="house">
						<button type="button" onclick="moveAll(0);" class="btn btn-secondary">Погасить все</button>
					</th>
				</thead>
				<thead class="table-secondary">
					<th class="floor">Первый этаж:</th>
					<th class="floor">
						<button type="button" onclick="moveFloor(1,0);" class="btn btn-secondary">Погасить все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td>Тамбур прихожей:</td>
						<td><button id="hallwayTambourOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
					<tr>
						<td>Прихожая:</td>
						<td><button id="hallwayOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
					<tr>
						<td>Котельная:</td>
						<td><button id="boilerRoomOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
					<tr>
						<td>Холл, верхний свет:</td>
						<td>
							<button id="hall1OverheadsMainLight" class="btn btn-lg">...</button>
							<button id="hall1OverheadsExtraLight" class="btn btn-lg">...</button>
						</td>
					</tr>
					<tr>
						<td>Кухня, верхний свет:</td>
						<td><button id="kitchenOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Гардеробная, верхний свет:</td>
						<td><button id="dressingRoomOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
					<tr>
						<td>Кладовая у кухни, верхний свет:</td>
						<td><button id="pantryOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>				
					<tr>
						<td>Кабинет Али, верхний свет:</td>
						<td><button id="alyaCabinetOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>	
					<tr>
						<td>Ванная комната, верхний свет:</td>
						<td><button id="bathroom1OverheadsLight" class="btn btn-lg">...</button></td>
					</tr>	
					<tr>
						<td>Сауна, верхний свет:</td>
						<td><button id="saunaOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>	
					<tr>
						<td>Сауна, нижняя подсветка:</td>
						<td><button id="saunaUnderLight" class="btn btn-lg">...</button></td>
					</tr>	
								
					<tr>
						<td>Лесница, подсветка:</td>
						<td><button id="stairwayLight" class="btn btn-lg">...</button></td>
					</tr>
				</tbody>				
				<thead class="table-secondary">
					<th class="floor">Второй этаж:</th>
					<th class="floor">
						<button type="button" onclick="moveFloor(1,0);" class="btn btn-secondary">Погасить все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td>Наша спальня, верхний свет:</td>
						<td><button id="ourBedroomOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Маленькая детская, верхний свет:</td>
						<td><button id="smallChildrenRoomOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Тамбур в коливинг, верхний свет:</td>
						<td><button id="colivingTambourOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Коливинг, верхний свет:</td>
						<td><button id="colivingOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Большая детская, верхний свет:</td>
						<td>
							<button id="biggerChildrenRoomOverheadsLight1" class="btn btn-lg">...</button>
							<button id="biggerChildrenRoomOverheadsLight2" class="btn btn-lg">...</button>
						</td>
					</tr>
					<tr>
						<td>Тамбур в Сашину комнату, верхний свет:</td>
						<td><button id="sashaTambourOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Санузел, верхний свет:</td>
						<td><button id="bathroom2OverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Сашина комната, верхний свет:</td>
						<td><button id="sashaOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Холл 2-го этажа, верхний свет:</td>
						<td><button id="hall2OverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Кабинет Дениса, верхний свет:</td>
						<td><button id="denisCabinetOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Свет на балконе 2-го этажа:</td>
						<td><button id="balconyLight" class="btn btn-lg">...</button></td>
					</tr>
				</tbody>
				<thead class="table-secondary">
					<th class="floor">Гараж:</th>
					<th class="floor">
						<button type="button" onclick="notimplementedyet();" class="btn btn-secondary">Погасить все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td>Верхний свет внутри:</td>
						<td><button id="garageOverheadsLight" class="btn btn-lg">...</button></td>
					</tr>
					<tr>
						<td>Освещение под навесом:</td>
						<td><button id="garageAwningLight" class="btn btn-lg">...</button></td>
					</tr>
				</tbody>
				<thead class="table-secondary">
					<th class="floor">Переключатели:</th>
					<th class="floor">
						<button type="button" onclick="notimplementedyet();" class="btn btn-secondary">Выключить все</button>
					</th>
				</thead>
				<tbody>
					<tr>
						<td>Клапан подкачки воды в систему отопления:</td>
						<td><button id="heatingPressureValve" class="btn btn-lg">...</button></td>
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

		function refreshForm()
		{
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			var API = GetAPIURL("lighting/GetStatus");
			$.getJSON(API)
				.done(function(data) {

					refreshButtons(data);

					spinner.stop();
					$('#spinner').hide();
				});
		}

		function refreshButtons(data)
		{
			// for each key in data
			for (key in data)
			{
				// console.log(key);
				refreshButtonView(key, data[key]);
			}
			// refreshButtonView('streetLight250', data['streetLight250']);
			// refreshButtonView('streetLight150', data['streetLight150']);
			// refreshButtonView('balconyLight', data['balconyLight']);
			// refreshButtonView('fenceLight', data['fenceLight']);
			// refreshButtonView('kitchenOverheadsLight', data['kitchenOverheadsLight']);
			// refreshButtonView('stairwayLight', data['stairwayLight']);

			// refreshButtonView('pantryOverheadsLight', data['pantryOverheadsLight']);
			// refreshButtonView('hallwayOverheadsLight', data['hallwayOverheadsLight']);
			// refreshButtonView('hallwayTambourOverheadsLight', data['hallwayTambourOverheadsLight']);
			// refreshButtonView('porchOverheadsLight', data['porchOverheadsLight']);
		}

		function refreshButtonView(applianceId, applianceStatus)
		{
			var button = $('#' + applianceId);
			button.off('click');
			if (applianceStatus == 0)
			{
				button.addClass('btn-warning').removeClass('btn-secondary');
				button.html('Зажечь');
				button.click({ applianceId: applianceId, newStatus: 1 }, applianceStatusUpdate);
			}
			else if (applianceStatus == 1)
			{
				button.addClass('btn-secondary').removeClass('btn-warning');
				button.html('Погасить');
				button.click({ applianceId: applianceId, newStatus: 0 }, applianceStatusUpdate);
			}
		}

		function applianceStatusUpdate(event)
		{
			var URL = GetAPIURL("lighting/ChangeStatus") + "/" + event.data.applianceId + "/" + event.data.newStatus;

			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.ajax({
				url: URL,
				type: 'PUT',
				dataType: 'json',
				success: function(data) {

					refreshButtons(data)

					spinner.stop();
					$('#spinner').hide();
				}
			});
		}
	</script>
</body>
</html>
