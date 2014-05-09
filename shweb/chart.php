<?php
function RenderChart($dataSourceURL, $yAxisTitle)
{
?>	

	<script>
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 420 - margin.top - margin.bottom;

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

	d3.json("<?=$dataSourceURL?>", function(error, data) {

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
	      .text("<?=$yAxisTitle?>");

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
<?php
}
?>