<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Монитор системы полива</title>

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
				width="100%" height="760"
				allowfullscreen 
				src="https://ec2-3-74-4-26.eu-central-1.compute.amazonaws.com/grafana/d/-1W4-rlVz/poliv?orgId=1&from=now-12h&to=now">
			</iframe>
		</div>
	</div>
</body>
</html>
