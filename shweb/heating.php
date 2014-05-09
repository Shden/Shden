<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Температурный график</title>

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">
</head>

<style>
.chart {
	font: 10px sans-serif;
}

.axis path,
.axis line {
	fill: none;
	stroke: #000;
	shape-rendering: crispEdges;
}

.axis .minor line {
	stroke: #777;
	stroke-dasharray: 2,2;
}

.line {
	fill: none;
	stroke-width: 2.5px;
}

</style>
<body>
	<script src="http://d3js.org/d3.v3.js"></script>

	<?php include 'menu.php';

	$days = (isset($_REQUEST[days])) ? $_REQUEST[days] : 1;
	?>
	<h2>Температурный график, интервал в днях: <?=$days?></h2>
	<a href="?days=1">Сутки</a> |
	<a href="?days=2">Двое суток</a> |
	<a href="?days=7">Неделя</a> |
	<a href="?days=14">2 недели</a> |
	<a href="?days=31">Месяц</a> |
	<a href="?days=61">2 месяца</a> |
	<br/>
	
	<script>
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .innerTickSize(width)
	    .orient("right");

	var line = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.time); })
	    .y(function(d) { return y(d.temperature); });

	var svg = d3.select("body")
	  .append("div")
    	    .attr("align", "center")
	    .attr("class", "chart")
	.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json("datasource/temperature.php?days=<?=$days?>", function(error, data) {

	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "time"; }));
  
	  data.forEach(function(d) {
	    d.time = parseDate(d.time);
	  });

	  var sensors = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.map(function(d) {
	        return { time: d.time, temperature: +d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(data, function(d) { return d.time; }));
	  y.domain([
	    d3.min(sensors, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
	    d3.max(sensors, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
	  ]);
  
	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  var gy = svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis);
  
	  gy.selectAll("g").filter(function(d) { return d; })
	      .classed("minor", true);

	  gy.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", "-14")
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Температура (С)");

	  var sensor = svg.selectAll(".sensor")
	      .data(sensors)
	    .enter().append("g")
	      .attr("class", "sensor");
      
	  sensor.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.name); });
      
	  sensor.append("text")
	      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.temperature) + ")"; })
	      .attr("x", 3)
	      .attr("dy", ".35em")
	      .text(function(d) { return d.name; });
	});

	</script>	

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://code.jquery.com/jquery.js"></script>
	<!-- Latest compiled and minified JavaScript -->
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

</body>
</html>