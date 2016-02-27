<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Статистика электросети</title>

	<?php include 'include/css.php';?>

	<!-- Shweb custom styles -->
	<link rel="stylesheet" href="css/shweb.css">
</head>
<body>
	
	<style>
	.datatable .error {
	    background-color: yellow;
	}
	.datatable .failure {
	    background-color: red;
	}
	.datatable {
		width: 100%;
        border-collapse: collapse;
        border: 2px solid black;
	}
	.datatable .leftalign {
		text-align: left;
	}
	.datatable .centeralign {
		text-align: center;
	}
	.datatable tr {
		text-align: right;
	}
    .datatable td {
		border: 1px solid black;
    }
	.datatable th {
		border: 1px solid black;
		text-align: right;
	}
	.datatable .f1 {
		background-color: #e0e0e0;
	}
	.datatable .f2 {
		background-color: #c0c0c0;
	}
	.datatable .f3 {
		background-color: #a0a0a0;
	}
	.datatable .lb {
		border-left: 2px solid black;
	}
	.datatable .rb {
		border-right: 2px solid black;
	}
	.datatable .bb {
		border-bottom: 2px solid black;
	}
	</style>

	<?php 
	include 'menu.php';
	include 'include/js.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 14;
	?>
	<h2>Статистика электросети, интервал в днях: <?=$days?></h2>
	<a href="?days=1">Сутки</a> |
	<a href="?days=2">Двое суток</a> |
	<a href="?days=7">Неделя</a> |
	<a href="?days=14">2 недели</a> |
	<a href="?days=21">3 недели</a> |
	<a href="?days=31">Месяц</a> 

	<div id="spinner" class="spinner"></div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
	<script type='text/javascript'>
	$('#spinner').show();
	var spinner = createSpinner('spinner');

	var table = d3.select(".container")
		.append("table")
			.attr("class", "datatable");
	
	var head = table.append("tr");
	head.append("th").attr("rowspan", 2).attr("class", "bb leftalign").text("Дата");
	for (var i=1; i<=3; i++)
		head.append("th").attr("colspan", 4).attr("class", "centeralign lb f"+i).text("Фаза "+i);
	head.append("th").attr("colspan", 3).attr("class", "centeralign lb").text("Ошибки (минут)");
	
	var head = table.append("tr");
	
	for (var i=1; i<=3; i++)
	{
		head.append("th").attr("class", "bb lb f"+i).text("Min (V)");
		head.append("th").attr("class", "bb f"+i).text("Max (V)");
		head.append("th").attr("class", "bb f"+i).text("Avg (V)");
		head.append("th").attr("class", "bb rb f"+i).text("STD");
	}
	head.append("th").attr("class", "bb").text("Низк.");
	head.append("th").attr("class", "bb").text("Выс.");
	head.append("th").attr("class", "bb").text("Откл.");
	
	d3.json("../datasource/powerstat.php?days=<?=$days?>", function(error, data) {
		var row = table.selectAll("row")
				.data(data)
			.enter().append("tr");
			
		row.attr("class", function(d) { return d.CutoffMinutes > 0 ? "failure" : ""; })
		
		row.append("td").attr("class", "leftalign rb").text(function(d) { return d.DATE; });

		for (i=1; i<=3; i++)
		{
			row.append("td")
				.attr("class", function(d) { return checkVal(230 * 0.9, 230 * 1.1, d["U"+i+"_MIN"], "lb f"+i); })
				.text(function(d) { return d["U"+i+"_MIN"]; });
			row.append("td")
				.attr("class", function(d) { return checkVal(230 * 0.9, 230 * 1.1, d["U"+i+"_MAX"], "f"+i); })
				.text(function(d) { return d["U"+i+"_MAX"]; });
			row.append("td").attr("class", "f"+i).text(function(d) { return d["U"+i+"_AVG"]; });
			row.append("td").attr("class", "rb f"+i).text(function(d) { return d["U"+i+"_STD"]; });
		}

		row.append("td").text(function(d) { return d.LowVMinutes; });
		row.append("td").text(function(d) { return d.HighVMinutes; });
		row.append("td").text(function(d) { return d.CutoffMinutes; });
	});
	
	spinner.stop();
	$('#spinner').hide();
	
	function checkVal(min, max, actual, defaultClass)
	{
		return (actual >= min && actual <= max) ? defaultClass : "error";
	}
	</script>
	
</body>
</html>