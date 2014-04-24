<?php // content="text/plain; charset=utf-8"
require_once ('jpgraph/jpgraph.php');
require_once ('jpgraph/jpgraph_line.php');
require_once ('include/db.inc');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

$res = $conn->query(	"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':00') as time, " .
			"AVG(external) as outTemp, " .
			"AVG(bedroom) as bedRoomTemp " .
			"FROM heating " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"GROUP BY HOUR(time), DATE(time) " .
			"ORDER BY DATE(time), HOUR(time);");

$times = array();
$bedRoomTemp = array();
$outTemp = array();

$res->data_seek(0);
while($r = $res->fetch_assoc())
{
	$times[] = $r['time'];
	$bedRoomTemp[] = $r['bedRoomTemp'];
	$outTemp[] = $r['outTemp'];
}

// Create the graph. These two calls are always required
$graph = new Graph(800,600);
$graph->SetMargin(40, 20, 50, 210);
$graph->SetScale('textlin');

$graph->xaxis->SetTickLabels($times);
//$graph->xaxis->SetFont(FF_ARIAL, FS_NORMAL, 8);
$graph->xaxis->SetLabelAngle(90);
$graph->xaxis->SetTextLabelInterval(count($times)/10);

// Create the linear plot
$linePlotOut = new LinePlot($outTemp);
//$linePlotOut->SetColor("blue");
$linePlotOut->SetLegend("На улице");

$linePlotBR = new LinePlot($bedRoomTemp);
//$linePlotBR->SetColor("red");
$linePlotBR->SetLegend("Спальня, контрольная");

//$lineplotHF = new LinePlot($hotfluid);
//$lineplotHF->SetColor('navy');

//$lineplotCF = new LinePlot($coldfluid);
//$lineplotCF->SetColor('pink');

// Add the plot to the graph
$graph->Add($linePlotOut);
$graph->Add($linePlotBR);
//$graph->Add($lineplotHF);
//$graph->Add($lineplotCF);

// Legend setup
$graph->legend->SetFrameWeight(1);
$graph->legend->SetPos(0.5, 0.98, "center", "bottom");

// Display the graph
$graph->Stroke();
?>
