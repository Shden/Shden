<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление вентиляцией</title>

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
				text-align: right;
			}
		</style>

		<div class="container" align="center">
			<h2>Управление вентиляцией</h2>
			<table>
				<tr>
					<td>Вентилятор в ванной:</td>
					<td><button id="streetLight250"
						class="btn btn-lg"
						onclick="setBathVentilationOn()">Включить ненадолго</button></a>
				</tr>
			</table>
			<div id="spinner" class="spinner">
		</div>
	</div>

	<?php include 'include/js.php';?>

	<script>


		function setBathVentilationOn(event)
		{
			var URL = "/API/1.1/climate/SetBathVentilationOn/3";

			$('#spinner').show();
			var spinner = createSpinner('spinner');

	        	$.ajax({
				url: URL,
				type: 'PUT',
				dataType: 'json',
				success: function(data) {

					spinner.stop();
					$('#spinner').hide();
				}
			});
		}
	</script>
</body>
</html>
