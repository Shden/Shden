<?php

/* Execute SQL statement and return JSON encoded resultset */
function SQL2JS($SQLStatement)
{
	require_once ('../include/db.inc');

	$res = $conn->query($SQLStatement);
	$rows = array();
	while($r = $res->fetch_assoc())
	{
		$rows[] = $r;
	}
	return json_encode($rows);
}
?>
