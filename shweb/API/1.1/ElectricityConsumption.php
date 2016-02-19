<?php
	
/**
 *	Electricity consumption API, including power meter data, aggregated consumption data and 
 *	historical data.
 */
Class ElectricityConsumption
{
	/**
	 *	Returns power meter current data.
	 *
	 *	@url GET /GetPowerMeterData
	 */
	public function GetPowerMeterData()
	{
		// Old power meter final values to sum up
		$oldPowerMeterDay = 21127;
		$oldPowerMeterNight = 11438;
	
		$mercuryStr = `/home/den/Shden/mercury236/mercury236 /dev/ttyUSB0 --json`;
		$mercuryData = json_decode($mercuryStr, true);
		
		// Enrich data to contain sum consumption with previous power meter. This is actually a temp thing.
		if ($mercuryData != null)
		{
			$mercuryData["PR-night"]["ap2"] = $mercuryData["PR-night"]["ap"] + $oldPowerMeterNight;
			$mercuryData["PR-day"]["ap2"] = $mercuryData["PR-day"]["ap"] + $oldPowerMeterDay;
			$mercuryData["PR"]["ap2"] = $mercuryData["PR-night"]["ap2"] + $mercuryData["PR-day"]["ap2"];
		}
		
		return $mercuryData;
	}
}
?>