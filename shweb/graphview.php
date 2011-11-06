<?php // content="text/plain; charset=utf-8"
require_once ('jpgraph/jpgraph.php');
require_once ('jpgraph/jpgraph_line.php');
require_once ('logparser.php');

if (isset($_REQUEST[start]) && isset($_REQUEST[finish]))
{  
	$parser = new LogParser("/home/den/shc/controller.log");

	list($times, $outTemp, $hotfluid, $coldfluid, $bedRoomTemp) = 
		$parser->GetStat($_REQUEST[start], $_REQUEST[finish]);

	// Create the graph. These two calls are always required
	$graph = new Graph(800,600);
	$graph->SetMargin(40, 20, 50, 210);
	$graph->SetScale('textlin');

	$graph->xaxis->SetTickLabels($times);
	//$graph->xaxis->SetFont(FF_ARIAL,FS_NORMAL, 8);
	$graph->xaxis->SetLabelAngle(90);
	$graph->xaxis->SetTextLabelInterval(count($times)/20);
	 
	// Create the linear plot
	$lineplotOut = new LinePlot($outTemp);
	$lineplotOut->SetColor('blue');

	$lineplotBR = new LinePlot($bedRoomTemp);
	$lineplotBR->SetColor('red');
	 
	$lineplotHF = new LinePlot($hotfluid);
	$lineplotHF->SetColor('navy');
	 
	$lineplotCF = new LinePlot($coldfluid);
	$lineplotCF->SetColor('pink');
	 
	// Add the plot to the graph
	$graph->Add($lineplotOut);
	$graph->Add($lineplotBR);
	$graph->Add($lineplotHF);
	$graph->Add($lineplotCF);
	 
	// Display the graph
	$graph->Stroke();
}
?>
