<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Теплые полы</title>

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
			<h2>Управление теплыми полами</h2>
			<div>
                                <b>Холл сегмент 1:</b> температура <span id="segment0t">...</span>, нагрев <span id="segment0h">...</span>.
                        </div>
			<div>
			        <b>Холл сегмент 2:</b> температура <span id="segment1t">...</span>, нагрев <span id="segment1h">...</span>.
                        </div>
                        <br/>
                        <a href="javascript:refreshForm();" id="hallSegment12Btn" class="btn" role="button">...</a>
			<div id="spinner" class="spinner">
		</div>
	</div>

	<?php include 'include/js.php';?>


</body>
</html>
