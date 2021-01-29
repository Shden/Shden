<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Температурный график</title>

	<?php include 'include/css.php';?>
</head>

<body>
	<div class="container">
		<?php
		include 'menu.php';
		include 'include/js.php';
		?>
		<iframe src="/grafana/d/X8fZOHLMk/brod?orgId=1&from=1611329939268&to=1611934739268&refresh=1h&viewPanel=2"></iframe>
	</div>
</body>
</html>
