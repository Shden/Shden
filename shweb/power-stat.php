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
	<div class="container">

		<?php 
		include 'menu.php';
		include 'include/js.php';
		?>

		<h2>Статистика электросети, интервал в днях: <span id="daysCount">...</span></h2>

		<div class="btn-group" role="group">
			<input type="radio" class="btn-check" name="btnradio" onclick="refreshForm(1)" id="day1" autocomplete="off">
			<label class="btn btn-outline-primary" for="day1">Сутки</label>

			<input type="radio" class="btn-check" name="btnradio" onclick="refreshForm(2)" id="day2" autocomplete="off">
			<label class="btn btn-outline-primary" for="day2">Двое суток</label>

			<input type="radio" class="btn-check" name="btnradio" onclick="refreshForm(7)" id="day7" autocomplete="off" checked>
			<label class="btn btn-outline-primary" for="day7">Неделя</label>

			<input type="radio" class="btn-check" name="btnradio" onclick="refreshForm(14)" id="day14" autocomplete="off">
			<label class="btn btn-outline-primary" for="day14">Две недели</label>
			
			<input type="radio" class="btn-check" name="btnradio" onclick="refreshForm(31)" id="day31" autocomplete="off">
			<label class="btn btn-outline-primary" for="day31">Месяц</label>
		</div>
		<br/><br/>
	
		<table class="table table-striped table-condensed">
			<thead>
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
			</thead>
			<tbody>
			</tbody>
		</table>
	</div>
	
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

		var table = d3.select(".table");
		
		var API = GetAPIURL("consumption/electricity/GetPowerStatistics/") + days;
		$.getJSON(API)
			.done(function(data) {
	
				spinner.stop();
				$('#spinner').hide();

				table.selectAll(".datarow").remove();

				let dataset = data[0];
				
				var row = table.select("tbody").selectAll("row")
					.data(dataset)
					.enter()
					.append("tr");
			
				row.attr("class", function(d) { 
					return (d.CutoffMinutes > 0 ? "table-danger datarow" : "datarow"); 
				})
		
				row.append("td").attr("class", "leftalign rb").text(function(d) { 
					return (new Date(d.DATE).toLocaleDateString()); 
				});

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
		return (value >= 230 * 0.9 && value <= 230 * 1.1) ? defaultClass : "warning";
	}
	</script>
	
</body>
</html>