<?php
include 'include/chart.js';

function RenderChartWithIntervals($chartHeader, $dataSourceURI, $c3formatiing)
{
?>

	<h2><?=$chartHeader?> <span id="days"></span></h2>
	<div class="btn-group" data-toggle="buttons">
		<label onclick="updateChart(1)" class="btn btn-primary active">
			<input type="radio" name="options" id="option1" autocomplete="off" checked>Сутки
		</label>
		<label onclick="updateChart(2)" class="btn btn-primary">
			<input type="radio" name="options" id="option2" autocomplete="off">Двое суток
		</label>
		<label onclick="updateChart(7)" class="btn btn-primary">
			<input type="radio" name="options" id="option3" autocomplete="off">Неделя
		</label>
		<label onclick="updateChart(14)" class="btn btn-primary">
			<input type="radio" name="options" id="option3" autocomplete="off">2 недели
		</label>
		<label onclick="updateChart(31)" class="btn btn-primary">
			<input type="radio" name="options" id="option3" autocomplete="off">Месяц
		</label>
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
