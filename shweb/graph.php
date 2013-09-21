<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
  <title>Температурный график</title>
</head>
<body>
<?include 'menu.php';

if ($_REQUEST[days] == "") $days = 1; else $days = $_REQUEST[days];
?>
<h2>Температурный график, интервал в днях: <?=$days?></h2>
<a href="?days=1">Сутки</a> |
<a href="?days=2">Двое суток</a> |
<a href="?days=7">Неделя</a> |
<a href="?days=14">2 недели</a> |
<a href="?days=21">3 недели</a> |
<a href="?days=31">Месяц</a> |
<br/>
<img src="graphview.php?days=<?=$days?>"/>
</body>
