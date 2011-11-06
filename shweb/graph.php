<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />     
  <title>Температурный график</title>
</head>
<body>
<?include 'menu.php';?>
<h2>Температурный график</h2>
<a href="graphview.php?start=<?=time()-60*60*24;?>&finish=<?=time()?>" target="gr">Сутки</a> |
<a href="graphview.php?start=<?=time()-60*60*24*2;?>&finish=<?=time()?>" target="gr">Двое суток</a> |
<a href="graphview.php?start=<?=time()-60*60*24*7;?>&finish=<?=time()?>" target="gr">Неделя</a> |
<a href="graphview.php?start=<?=time()-60*60*24*30;?>&finish=<?=time()?>" target="gr">Месяц</a> |
Интервал |
<iframe name="gr" width="100%" height="600">
<iframe>
</body>
