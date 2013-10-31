<html>
<head>    
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
</head>
<body>
<?include 'menu.php';?>
<form action="ups.php">
	Show me last: 
	<a href="?n=10">50 lines</a> |
	<a href="?n=60">100 lines</a> |
	other:
	<input type="text" name="n" value="<select>"/>
	<input type="submit" value="Go"/>
</form>
<hr/>
<?
if ($_REQUEST[n] == "") $n = 50; else $n = $_REQUEST[n];
$output = `tail /var/log/apcupsd.events -n$n`;
print "<pre>$output</pre>";
?>
</body>
</html>

