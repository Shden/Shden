<?php // content="text/plain; charset=utf-8"
require_once ('jpgraph/jpgraph.php');
require_once ('jpgraph/jpgraph_line.php');

$days = 1;
if (isset($_REQUEST[days])) $days = $_REQUEST[days];

$DBHost = "localhost";
$DBUser = "root";
$DBPass = "express";
$DBName = "SHDEN";

$conn = mysql_connect($DBHost, $DBUser, $DBPass) or die("Unable to connect to the database.");
mysql_select_db($DBName, $conn) or die("Unable to select database $DBName.");

$query_TempRS = "SELECT CONCAT(DATE(time), ' ', HOUR(time), 'h') as time, " .
		"AVG(external) as outTemp, " .
		"AVG(bedroom) as bedRoomTemp " .
		"FROM heating " .
		"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
		"GROUP BY HOUR(time), DATE(time) " .
		"ORDER BY DATE(time), HOUR(time);";

$TempRS = mysql_query($query_TempRS) or die(mysql_error());

$times = array();
$bedRoomTemp = array();
$outTemp = array();

while($row_TempRS = mysql_fetch_array($TempRS))
{
	$times[] = $row_TempRS['time'];
	$bedRoomTemp[] = $row_TempRS['bedRoomTemp'];
	$outTemp[] = $row_TempRS['outTemp'];
}

// Create the graph. These two calls are always required
$graph = new Graph(800,600);
$graph->SetMargin(40, 20, 50, 210);
$graph->SetScale('textlin');

$graph->xaxis->SetTickLabels($times);
//	$graph->xaxis->SetFont(FF_ARIAL, FS_NORMAL, 8);
$graph->xaxis->SetLabelAngle(90);
$graph->xaxis->SetTextLabelInterval(count($times)/20);

// Create the linear plot
$lineplotOut = new LinePlot($outTemp);
$lineplotOut->SetColor('blue');

$lineplotBR = new LinePlot($bedRoomTemp);
$lineplotBR->SetColor('red');

//$lineplotHF = new LinePlot($hotfluid);
//$lineplotHF->SetColor('navy');

//$lineplotCF = new LinePlot($coldfluid);
//$lineplotCF->SetColor('pink');

// Add the plot to the graph
$graph->Add($lineplotOut);
$graph->Add($lineplotBR);
//$graph->Add($lineplotHF);
//$graph->Add($lineplotCF);

// Display the graph
$graph->Stroke();
?>
