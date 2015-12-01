<?php
require_once ('../../include/db.inc');


/* Status API endpoint */	
Class Status
{
	/**
	 *
	 * @url GET /GetHouseStatus
	 */
	public function GetHouseStatus()
	{
		global $conn;
		
		$res = $conn->query("SELECT	time, isin FROM presence ORDER BY time desc LIMIT 1;");
		if ($r = $res->fetch_assoc()) 
		{
			$isin = (integer)$r["isin"];
			$starting = $r["time"];
		}

		$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
		$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;

		
		return array(
					"climate" => array(
						"outTemp" 		=> $outsideTemp, 
						"bedRoomTemp" 	=> $bedRoomTemp),
					"mode" => array(
						"isin"			=> $isin,
						"starting"		=> $starting
					)
				);
	}
}

?>