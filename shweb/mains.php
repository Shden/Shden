<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Управление электропитанием</title>

	<?php include 'include/css.php';?>

	<!-- Shweb cutom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	<?php include 'menu.php';

	if (isset($_REQUEST['changeMainsStatusTo'])) 
	{
		$newStatus = $_REQUEST['changeMainsStatusTo'];
		`echo $newStatus >> /home/den/Shden/appliances/mainsSwitch`;
	}

	$mainsStatus = (int)`cat /home/den/Shden/appliances/mainsSwitch`;
	?>

	<div class="container" align="center">
		<h2>Управление электропитанием</h2>
		<table>
			<tr>
				<td>
					<a href="?changeMainsStatusTo=<?=($mainsStatus == 1) ? 0 : 1?>" 
						class="btn <?=($mainsStatus == 1) ? "btn-default" : "btn-warning"?> btn-lg" role="button">
						<?=($mainsStatus == 1) ? "В режим ожидания" : "В режим присутствия"?> 
					</a>
				</td>
			</tr>
		</table>
			
	</div>

	<?php include 'include/js.php';?>
</body>
</html>
