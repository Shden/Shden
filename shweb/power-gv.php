<?php // content="text/plain; charset=utf-8"
require_once ('jpgraph/jpgraph.php');
require_once ('jpgraph/jpgraph_line.php');
require_once ('include/db.inc');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

$res = $conn->query(	"SELECT CONCAT(DATE(time), ' ', HOUR(time), ':00') as time, " .
			"U1, U2, U3 " .
			"FROM power " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"ORDER BY DATE(time), HOUR(time);");

$times = array();
$U1 = array();
$U2 = array();
$U3 = array();

$res->data_seek(0);
while($r = $res->fetch_assoc())
{
	$times[] = $r['time'];
	$U1[] = $r['U1'];
	$U2[] = $r['U2'];
	$U3[] = $r['U3'];
}

// Create the graph. These two calls are always required
$graph = new Graph(800, 600);
$graph->SetMargin(40, 20, 50, 210);
$graph->SetScale('textlin');

$graph->xaxis->SetTickLabels($times);
$graph->xaxis->SetLabelAngle(90);
$graph->xaxis->SetTextLabelInterval(count($times)/(10 * 60));

// Create the linear plot
$lineU1 = new LinePlot($U1);
$lineU1->SetLegend("Напряжение фаза 1");

$lineU2 = new LinePlot($U2);
$lineU2->SetLegend("Напряжение фаза 2");

$lineU3 = new LinePlot($U3);
$lineU3->SetLegend("Напряжение фаза 3");

// Add the plot to the graph
$graph->Add($lineU1);
$graph->Add($lineU2);
$graph->Add($lineU3);

// Legend setup
$graph->legend->SetFrameWeight(1);
$graph->legend->SetPos(0.5, 0.98, "center", "bottom");

// Display the graph
$graph->Stroke();
?>
