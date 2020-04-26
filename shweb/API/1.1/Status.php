<?php
require_once ('../../include/db.inc');

/**
 *	House status API endpoint. This API is primarely works with overall house status, including status snaps for remote
 *	monitoring and status changing.
 */
Class Status
{
	const HTTP_BAD_REQUEST = 400;

	/**
	 *	Return house status information.
	 *
	 *	@url GET /GetHouseStatus
	 */
	public function GetHouseStatus()
	{
		global $conn;

		$res = $conn->query("SELECT time, isin FROM presence ORDER BY time desc LIMIT 1;") or die($conn->error);
		if ($r = $res->fetch_assoc())
		{
			$isin = (integer)$r["isin"];
			$starting = $r["time"];
		}

		$outsideTemp = (float)`cat /home/den/Shden/appliances/outsideTemp`;
		$bedRoomTemp = (float)`cat /home/den/Shden/appliances/bedRoomTemp`;
		$kitchenTemp = (float)`cat /home/den/Shden/appliances/kitchenTemp`;
		$mainsStatus = (int)`cat /home/den/Shden/appliances/mainsSwitch`;

		$insideTemp = ($kitchenTemp + $bedRoomTemp) / 2;

		$climate = new Climate;
		$electricity = new ElectricityConsumption;

		try
		{
			$power = $electricity->GetPowerMeterData();
		}
		catch(RestException $e)
		{
			$power = $e->getMessage();
		}

		return array(
			"climate" => array(
				"outTemp" 	=> $outsideTemp,
				"inTemp"	=> $insideTemp
			),
			"mode" => array(
				"presence"	=> $isin,
				"starting"	=> $starting,
				"mains"		=> $mainsStatus
			),
			"power" => $power,
			"tempStat" => array(
				"day" 	=> $climate->GetTempStatistics(1),
				"month" => $climate->GetTempStatistics(30)
			)
		);
	}

	/**
	 *	Change house mode to the mode provided.
	 *
	 *	@url PUT /SetHouseMode/$changeStatusTo
	 *	$changeStatusTo: 1 - presence mode, 0 - standby mode
	 */
	public function SetHouseMode($changeStatusTo)
	{
		global $conn;

		if ($changeStatusTo != 1 && $changeStatusTo != 0)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				'Invalid status requested.');
		}
		$conn->query("CALL SP_CHANGE_PRESENCE($changeStatusTo);");

		// update repellers status
		$repellers = new Repellers;
		$lighting = new Lighting;
		if ($changeStatusTo == 1)
		{
			// for presence mode:
			$repellers->SetStatus(0);

			$this->SetMains(1);
		}
		else
		{
			// for standby mode:

			// repellers ON
			$repellers->SetStatus(1);

			// lights OFF
			$lighting->ChangeStatus('streetLight250', 0);
			$lighting->ChangeStatus('streetLight150', 0);
			$lighting->ChangeStatus('balkonLight', 0);
			$lighting->ChangeStatus('fenceLight', 0);

			$this->SetMains(0);
		}

		return $this->GetHouseStatus();
	}

	/**
	 *	Controls mains status.
	 *
	 *	@param $mainsStatus - mains status to set.
	 */
	private function SetMains($mainsStatus)
	{
		if ($mainsStatus == 0 || $mainsStatus == 1)
		{
			`echo $mainsStatus >> /home/den/Shden/appliances/mainsSwitch`;
		}
		else
			throw new RestException(self::HTTP_BAD_REQUEST,
				'Invalid mains status.');
	}
}

?>
