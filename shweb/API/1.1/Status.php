<?php
require_once ('../../include/db.inc');


/** 
 *	House status API endpoint. This API is primarely works with overall house status, including status snaps for remote
 *	monitoring and status changing.
 */	
Class Status
{
	/**
	 * Return house status information.
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
						"outTemp" 	=> $outsideTemp, 
						"inTemp"	=> $bedRoomTemp
					),
					"mode" => array(
						"presence"	=> $isin,
						"starting"	=> $starting
					)
				);
	}
	
	/**
	 * Change house mode to the mode provided.
	 *
	 * @url PUT /SetHouseMode/$changeStatusTo
	 */
	public function SetHouseMode($changeStatusTo)
	{
		global $conn;
		
		if ($changeStatusTo != 1 && $changeStatusTo != 0)
		{
			throw new RestException(400, 'Invalid staus requested.');
		}
		$conn->query("CALL SP_CHANGE_PRESENCE($changeStatusTo);");
		
		return $this->GetHouseStatus();
	}
}

?>