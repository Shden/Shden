<?php

/* Execute SQL statement and return resultset as an array */
function SQL2Array($SQLStatement)
{
	require_once ("../include/db.inc");
	$res = $conn->query($SQLStatement);
	$arr = array();
	while($r = $res->fetch_assoc())
	{
		$arr[] = $r;
	}
	return $arr;
}

/* Execute SQL statement and return JSON encoded resultset */
function SQL2JS($SQLStatement)
{
	return json_encode(SQL2Array($SQLStatement));
}
?>
