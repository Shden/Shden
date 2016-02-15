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
		$mercuryData = `/home/den/Shden/mercury236/mercury236 /dev/ttyUSB0 --json`;
		return json_decode($mercuryData, true);;
	}
}
?>