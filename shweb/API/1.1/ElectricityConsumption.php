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
