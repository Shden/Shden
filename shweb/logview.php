<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Просмотр журнала</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
</head>
<body>
	<?php 
	include 'menu.php';
	$log = $_REQUEST['log'];
	?>
	<form action="logview.php">
		Show me last: 
		<a href="?n=10&log=<?=$log?>">10 lines</a> |
		<a href="?n=50&log=<?=$log?>">50 lines</a> |
		<a href="?n=100&log=<?=$log?>">100 lines</a> |
		other:
		<input type="text" name="n" value="<select>"/>
		<input type="hidden" name="log" value="<?=$log?>"/>
		<input type="submit" value="Go"/>
	</form>
	<h2><?=$log?></h2>
	
	<?php
	$n = (isset($_REQUEST['n'])) ? $_REQUEST['n'] : 10;
	$output = `tail /home/den/Shden/shc/log/$log -n$n`;
	print "<pre>$output</pre>";
	?>
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</body>
</html>
