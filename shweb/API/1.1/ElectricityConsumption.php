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

	/**
	 *	Returns power consumption (kWh) by hours for the period of
	 *	$days specified.
	 *
	 *	@url GET /GetPowerConsumptionByHours/$days
	 */
	public function GetPowerConsumptionByHours($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 300)
			throw new RestException(400, "Invalid request parameter: $days.");

		global $conn;
		$time_zone = new DateTimeZone(TZ);

		$res = $conn->query(
			"SELECT DATE(time) as Date, HOUR(time) as Hour, " .
			"SUM(SS)/60/1000 as ssPower " .
			"FROM power " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"GROUP BY HOUR(time), DATE(time) " .
			"ORDER BY DATE(time), HOUR(time);");

		$arr = array();
		while($r = $res->fetch_assoc())
		{
			$moment = DateTime::createFromFormat("Y-m-d", $r["Date"], $time_zone);
			$moment->setTime($r["Hour"], 0);

			$arr[] = array(
				"date" 		=> $moment->format(DateTime::ISO8601),
				"ssPower"	=> (float) $r["ssPower"]
			);
		}
		$res->free();

		return $arr;
	}

	/**
	 *	Returns power consumption (kWh) by days for the period of
	 *	$days specified.
	 *
	 *	@url GET /GetPowerConsumptionByDays/$days
	 */
	public function GetPowerConsumptionByDays($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 300)
			throw new RestException(400, "Invalid request parameter: $days.");

		global $conn;
		$time_zone = new DateTimeZone(TZ);

		$res = $conn->query(
			"SELECT DATE(time) as Date, " .
			"SUM(SS)/60/1000 as ssPower " .
			"FROM power " .
			"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
			"GROUP BY DATE(time) " .
			"ORDER BY DATE(time);");

		$arr = array();
		while($r = $res->fetch_assoc())
		{
			$moment = DateTime::createFromFormat("Y-m-d", $r["Date"], $time_zone);
			$moment->setTime(0, 0);

			$arr[] = array(
				"date" 		=> $moment->format(DateTime::ISO8601),
				"ssPower"	=> (float) $r["ssPower"]
			);
		}
		$res->free();

		return $arr;
	}

	/**
	 *	Temporary thing. Reduce power consumption immediately to
	 *	avoid fuse blow.
	 *
	 *	@url PUT /DropPowerConsumption
	 */
	public function DropPowerConsumption()
	{
		// turn off main heater (12 kWh) immediately
		// (next minute controller will re-evaluate consumption and
		// temperature and update heater state accordingly).
		`echo 0 >> /home/den/Shden/appliances/mainHeater`;
		return 1;
	}


	// Fully qualified name of the power meter gate executable.
	private function GetPowerMeterGateFileName()
	{
		return
			$_SERVER['DOCUMENT_ROOT'] . "/../mercury236/mercury236";
	}
}
?>
