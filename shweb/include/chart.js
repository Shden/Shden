<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.18/c3.css" integrity="sha256-4RzAUGJSSgMc9TaVEml6THMrB96T28MR6/2FJ3RCHBQ=" crossorigin="anonymous" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.18/c3.js" integrity="sha256-8Roi9vOs6/KPNbW4O/JoZZoNFI/iM36Ekn0sklwEZa0=" crossorigin="anonymous"></script>

<script type='text/javascript'>

// Append SVG chart to display data from URL provided using D3.js library.
function DisplayChart(dataSourceURL, c3formatiing)
{
	$('#spinner').show();
	var spinner = createSpinner('spinner');

	d3.json(dataSourceURL, function(error, d) {
		c3formatiing.data.json = d;
		var chart = c3.generate(c3formatiing);
	});

	spinner.stop();
	$('#spinner').hide();
}
</script>
