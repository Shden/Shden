<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
<?php include 'menu.php';?>
<form action="heating.php">
	Show me last: 
	<a href="?n=10">10 lines</a> |
	<a href="?n=60">60 lines</a> |
	other:
	<input type="text" name="n" value="<select>"/>
	<input type="submit" value="Go"/>
</form>
<hr/>
<?php
$n = (isset($_REQUEST['n'])) ? $_REQUEST['n'] : 10;
$output = `tail /home/den/Shden/shc/log/heating.log -n$n`;
print "<pre>$output</pre>";
?>
</body>
</html>

