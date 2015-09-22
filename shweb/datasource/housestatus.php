<?php 
include 'sql2js.php';

header('Content-type: application/json');
	
echo SQL2JS("CALL SP_GET_STATISTICS();");

?>
