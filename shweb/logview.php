<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Просмотр журнала</title>

	<?php include 'include/css.php';?>
</head>
<body>
	<?php 
	include 'menu.php';
	$log = $_REQUEST['log'];
	?>
	<h2><?=$log?></h2>
	
	<?php
	$output = `tail /home/den/Shden/shc/log/$log -n10`;
	print "<pre>$output</pre>";
	?>
	
	<?php include 'include/js.php';?>
</body>
</html>

