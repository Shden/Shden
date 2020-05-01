<?php
include 'include/chart.js';

function RenderChartWithIntervals($chartHeader, $dataSourceURI, $c3formatiing)
{
?>

	<h2><?=$chartHeader?> <span id="days"></span></h2>
	<div class="btn-group" role="group">
		<button onclick="updateChart(1)" type="button" class="btn btn-secondary">Сутки</button>
  		<button onclick="updateChart(2)" type="button" class="btn btn-secondary">Двое суток</button>
		<button onclick="updateChart(7)" type="button" class="btn btn-secondary">Неделя</button>
		<button onclick="updateChart(14)" type="button" class="btn btn-secondary">Две недели</button>
		<button onclick="updateChart(31)" type="button" class="btn btn-secondary">Месяц</button>
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
