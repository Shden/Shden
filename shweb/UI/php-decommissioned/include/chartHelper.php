<?php
include 'include/chart.js';

function RenderChartWithIntervals($chartHeader, $dataSourceURI, $c3formatiing)
{
?>

	<h2><?=$chartHeader?> <span id="days"></span></h2>

	<div class="btn-group" role="group">
		<input type="radio" class="btn-check" name="btnradio" onclick="updateChart(1)" id="day1" autocomplete="off" checked>
		<label class="btn btn-outline-primary" for="day1">Сутки</label>

		<input type="radio" class="btn-check" name="btnradio" onclick="updateChart(2)" id="day2" autocomplete="off">
		<label class="btn btn-outline-primary" for="day2">Двое суток</label>

		<input type="radio" class="btn-check" name="btnradio" onclick="updateChart(7)" id="day7" autocomplete="off">
		<label class="btn btn-outline-primary" for="day7">Неделя</label>

		<input type="radio" class="btn-check" name="btnradio" onclick="updateChart(14)" id="day14" autocomplete="off">
		<label class="btn btn-outline-primary" for="day14">Две недели</label>
		
		<input type="radio" class="btn-check" name="btnradio" onclick="updateChart(31)" id="day31" autocomplete="off">
		<label class="btn btn-outline-primary" for="day31">Месяц</label>
	</div>

	<div id="chart" style="height:75vh;" />

	<div id="spinner" class="spinner"/>

	<script>
		$(document).ready(function() {
			updateChart(1);
		});

		function updateChart(days)
		{
			$('#days').html(days);
			DisplayChart(
				GetAPIURL('<?=$dataSourceURI?>' + days),
				<?=$c3formatiing?>
			);
		}
	</script>

<?php
}
?>
