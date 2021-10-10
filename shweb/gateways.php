<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление воротами</title>

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
			h2
			{
				text-align: center;
			}	
		</style>

		<div class="container col-sm-6">

			<h2>Управление воротами</h2>

			<table class="table table-striped">
				<tbody>
					<tr>
						<td>Ворота парковки около дома:</td>
						<td><button class="btn btn-lg btn-success" onclick="gateOpen('gateA')">Открыть</button></td>
						<td><button class="btn btn-lg btn-danger" onclick="gateClose('gateA')">Закрыть</button></td>
					</tr>
				</tbody>
			</table>
			<div id="spinner" class="spinner">
		</div>
	</div>

	<?php include 'include/js.php';?>

	<script>

		function gateOpen(gateName)
		{
			if (!confirm('Открываем ворота?')) return;

			var URL = GetAPIURL("gateways/Open") + "/" + gateName;
			callAPI(URL);
		}

		function gateClose(gateName)
		{
			if (!confirm('Закрываем ворота?')) return;
			
			var URL = GetAPIURL("gateways/Close") + "/" + gateName;
			callAPI(URL);
		}

		function callAPI(URL)
		{
			$('#spinner').show();
			var spinner = createSpinner('spinner');

			$.ajax({
				url: URL,
				type: 'PUT',
				dataType: 'json',
				success: function(data) {

					spinner.stop();
					$('#spinner').hide();
					alert('Готово');
				}
			});
		}
	</script>
</body>
</html>
