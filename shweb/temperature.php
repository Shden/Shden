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
		<div class="embed-responsive">
			<iframe 
				class="embed-responsive-item" 
				width="100%" height="800"
				allowfullscreen 
				src="https://ec2-18-184-115-169.eu-central-1.compute.amazonaws.com/grafana/d/X8fZOHLMk/brod?orgId=1&from=1611329939268&to=1611934739268&refresh=1h&viewPanel=2">
			</iframe>
		</div>
	</div>
</body>
</html>
