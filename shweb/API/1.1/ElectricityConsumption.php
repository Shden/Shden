<?php
require_once ('../../include/sql2js.php');

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

		$gateExecutable = $this->GetPowerMeterGateFileName();

		// add  --testRun for local debug
		$commandLine = $gateExecutable . " /dev/ttyUSB0 --json";

		exec($commandLine, $screenArray, $exitCode);
		$mercuryStr = implode('', $screenArray);

		if ($exitCode != 0 )
			throw new RestException(
				400, "'$commandLine' returned $exitCode");

		//$mercuryStr = `$gateExecutable /dev/ttyUSB0 --json --testRun`;
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

	/**
	 *	Returns power meter statistics for specific period.
	 *
	 *	@url GET /GetPowerStatistics/$days
	 */
	public function GetPowerStatistics($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 365)
		{
			throw new RestException(400, "Invalid period ($days) specified.");
		}
		return SQL2Array("CALL SP_GET_POWER_STATISTICS(DATE(DATE_ADD(NOW(), INTERVAL -$days+1 DAY)), NOW());");
	}

	// Fully qualified name of the power meter gate executable.
	private function GetPowerMeterGateFileName()
	{
		return
			$_SERVER['DOCUMENT_ROOT'] . "/../mercury236/mercury236";
	}
}
?>
