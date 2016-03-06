<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Энергопотребление системы отопления</title>

	<?php include 'include/css.php';?>

	<link rel="stylesheet" href="css/shweb.css">
	<link rel="stylesheet" href="css/datatable.css">
</head>
<body>

	<?php 
	include 'menu.php';
	include 'include/js.php';
	?>

	<h2>Энергопотребление системы отопления, интервал в днях: <span id="daysCount">...</span></h2>

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
			<th class="bb leftalign">Дата</th>
			<th class="bb centeralign lb" colspan="3">Снаружи, &deg;C (средняя/мин/макс)</th>
			<th class="bb centeralign lb">Внутри, &deg;C</th>
			<th class="bb centeralign lb" colspan="3">Время обогрева, ч (всего/ночь/день)</th>
			<th class="bb centeralign lb" colspan="3">Стоимость, руб (всего/ночь/день)</th>
		</tr>
	</table>

	<div id="spinner" class="spinner"></div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>

	<script>

	$(document).ready(function() {
		refreshForm(14);
	});
	
	function refreshForm(days)
	{	
		$('#spinner').show();
		var spinner = createSpinner('spinner');
		
		$('#daysCount').html(days);

		var table = d3.select(".datatable");
	
		$.getJSON(GetAPIURL("heating/GetHeatingConsumption/" + days))
			.done(function(data) {
	
				spinner.stop();
				$('#spinner').hide();

				table.selectAll(".datarow").remove();
				
				var row = table.selectAll("row")
					.data(data)
					.enter()
					.append("tr")
					.attr("class", "datarow");
			
				row.append("td").text(function(d) { return d.Date; }).attr("class", "leftalign rb");
				row.append("td").text(function(d) { return numeral(d.AvgOutside).format('0.0'); });
				row.append("td").text(function(d) { return numeral(d.MinOutside).format('0.0'); });
				row.append("td").text(function(d) { return numeral(d.MaxOutside).format('0.0'); }).attr("class", "rb");
				row.append("td").text(function(d) { return numeral(d.Inside).format('0.0'); }).attr("class", "rb");
				row.append("td").text(function(d) { return numeral(d.HeatingTotalTime).format('0.0'); });
				row.append("td").text(function(d) { return numeral(d.HeatingNightTime).format('0.0'); });
				row.append("td").text(function(d) { return numeral(d.HeatingDayTime).format('0.0'); }).attr("class", "rb");
				row.append("td").text(function(d) { return numeral(d.TotalCost).format('0.00'); });
				row.append("td").text(function(d) { return numeral(d.NightCost).format('0.00'); });
				row.append("td").text(function(d) { return numeral(d.DayCost).format('0.00'); });
			});
	}
	</script>
</body>
</html>
