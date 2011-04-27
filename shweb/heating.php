<html>
<body>
<?include 'menu.php';?>
<form action="heating.php">
	Show me last: 
	<a href="?n=10">10 lines</a> |
	<a href="?n=60">60 lines</a> |
	other:
	<input type="text" name="n" value="<select>"/>
	<input type="submit" value="Go"/>
</form>
<hr/>
<?
if ($_REQUEST[n] == "") $n = 10; else $n = $_REQUEST[n];
$output = `tail /home/den/shc/controller.log -n$n`;
print "<pre>$output</pre>";
?>
</body>
</html>

