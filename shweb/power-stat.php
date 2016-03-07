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
	<link rel="stylesheet" href="css/datatable.css">
</head>
<body>

	<?php 
	include 'menu.php';
	include 'include/js.php';
	?>

	<h2>Статистика электросети, интервал в днях: <span id="daysCount">...</span></h2>

	<div class="btn-group" role="group">
		<a href="javascript:refreshForm(1)" class="btn btn-default">Сутки</a>
		<a href="javascript:refreshForm(2)" class="btn btn-default">Двое суток</a>
		<a href="javascript:refreshForm(7)" class="btn btn-default">Неделя</a>
		<a href="javascript:refreshForm(14)" class="btn btn-default">2 недели</a>
		<a href="javascript:refreshForm(21)" class="btn btn-default">3 недели</a>
		<a href="javascript:refreshForm(31)" class="btn btn-default">Месяц</a> 
	</div>
	<br/><br/>
	
	<table class="datatable">
		<tr>
			<th rowspan="2" class="leftalign">Дата</th>
			<th colspan="4" class="centeralign lb">Фаза 1</th>
			<th colspan="4" class="centeralign lb">Фаза 2</th>
			<th colspan="4" class="centeralign lb">Фаза 3</th>
			<th colspan="3" class="centeralign lb">Ошибки (минут)</th>
		</tr>
		<tr>
			<th>Min (V)</th>
			<th>Max (V)</th>
			<th>Avg (V)</th>
			<th class="rb">STD</th>
			
			<th>Min (V)</th>
			<th>Max (V)</th>
			<th>Avg (V)</th>
			<th class="rb">STD</th>
			
			<th>Min (V)</th>
			<th>Max (V)</th>
			<th>Avg (V)</th>
			<th class="rb">STD</th>
			
			<th>Низк.</th>
			<th>Выс.</th>
			<th>Откл.</th>
		</tr>
	</table>

	<div id="spinner" class="spinner"></div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>
	<script>

	$(document).ready(function() {
		refreshForm(7);
	});
	
	function refreshForm(days)
	{	
		$('#spinner').show();
		var spinner = createSpinner('spinner');
		
		$('#daysCount').html(days);

		// $('.datatable').remove();
		// var table = d3.select(".container")
		// 	.append("table")
		// 		.attr("class", "datatable");
		var table = d3.select(".datatable");
	
		// var head = table.append("tr");
		// head.append("th").attr("rowspan", 2).attr("class", "bb leftalign").text("Дата");
		// for (var i=1; i<=3; i++)
		// 	head.append("th").attr("colspan", 4).attr("class", "centeralign lb f"+i).text("Фаза "+i);
		// head.append("th").attr("colspan", 3).attr("class", "centeralign lb").text("Ошибки (минут)");
		//
		// var head = table.append("tr");
		//
		// for (var i=1; i<=3; i++)
		// {
		// 	head.append("th").attr("class", "bb lb f"+i).text("Min (V)");
		// 	head.append("th").attr("class", "bb f"+i).text("Max (V)");
		// 	head.append("th").attr("class", "bb f"+i).text("Avg (V)");
		// 	head.append("th").attr("class", "bb rb f"+i).text("STD");
		// }
		// head.append("th").attr("class", "bb").text("Низк.");
		// head.append("th").attr("class", "bb").text("Выс.");
		// head.append("th").attr("class", "bb").text("Откл.");
	
		var API = GetAPIURL("consumption/electricity/GetPowerStatistics/") + days;
		$.getJSON(API)
			.done(function(data) {
	
				spinner.stop();
				$('#spinner').hide();

				table.selectAll(".datarow").remove();
				
				var row = table.selectAll("row")
					.data(data)
					.enter()
					.append("tr");
			
				row.attr("class", function(d) { return d.CutoffMinutes > 0 ? "failure datarow" : "datarow"; })
		
				row.append("td").attr("class", "leftalign rb").text(function(d) { return d.DATE; });

				for (i=1; i<=3; i++)
				{
					row.append("td")
						.attr("class", function(d) { return checkVal(d["U"+i+"_MIN"], "lb"); })
						.text(function(d) { return d["U"+i+"_MIN"]; });
					row.append("td")
						.attr("class", function(d) { return checkVal(d["U"+i+"_MAX"], ""); })
						.text(function(d) { return d["U"+i+"_MAX"]; });
					row.append("td").text(function(d) { return d["U"+i+"_AVG"]; });
					row.append("td").attr("class", "rb").text(function(d) { return d["U"+i+"_STD"]; });
				}

				row.append("td").text(function(d) { return d.LowVMinutes; });
				row.append("td").text(function(d) { return d.HighVMinutes; });
				row.append("td").text(function(d) { return d.CutoffMinutes; });
			});
	}
	
	function checkVal(value, defaultClass)
	{
		return (value >= 230 * 0.9 && value <= 230 * 1.1) ? defaultClass : "error";
	}
	</script>
	
</body>
</html>