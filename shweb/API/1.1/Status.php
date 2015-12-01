<?php

/* Status API endpoint */	
Class Status
{
	/**
	 *
	 * @url GET /GetHouseStatus
	 */
	public function GetHouseStatus()
	{
		$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
		$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;

		return array("now" => array(
							"outTemp" 		=> $outsideTemp, 
							"bedRoomTemp" 	=> $bedRoomTemp)
					);
	}
}

?>