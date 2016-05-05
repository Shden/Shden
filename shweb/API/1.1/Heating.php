<?php
require_once '../../include/ini.php';
require_once ('../../include/sql2js.php');

define(TZ, "MSK");

/** 
 *	House heating API endpoint. This API is desginged to control most of the heating system parameters including
 *	different heating schedules for various house modes, schedules etc.
 */	
Class Heating
{
	/**
	 * Return heating schedule information.
	 *
	 * @url GET /GetSchedule
	 */
	public function GetSchedule()
	{
		global $controller_ini;
		$controller_config = parse_ini_file($controller_ini, true);
		
		$arrival_segments = explode(".", $controller_config[schedule][arrive_date]);
		$departure_segments = explode(".", $controller_config[schedule][dep_date]);
		
		$time_zone = new DateTimeZone(TZ);
		$arrival_date = new DateTime(now, $time_zone);
		$departure_date = new DateTime(now, $time_zone);
		$arrival_date->setDate($arrival_segments[2], $arrival_segments[1], $arrival_segments[0]);
		$departure_date->setDate($departure_segments[2], $departure_segments[1], $departure_segments[0]);
		$arrival_date->setTime($controller_config[schedule][arrive_hour], 0);
		$departure_date->setTime($controller_config[schedule][dep_hour], 0);
		
		// Use ::ATOM as ::ISO8601 is not ISO8601 compatible =|. That's the beauty of PHP
		return array(
					"from" 	=> $arrival_date->format(DateTime::ATOM),
					"to" => $departure_date->format(DateTime::ATOM),
					"active" => $departure_date > new DateTime(now, $time_zone) ? 1 : 0
				);
	}
	
	/**
	 *	Set heating schedule by time and duration provided.
	 * 	
	 *	Arrival date & time parameters block:
	 *	@param $arr_year - scheduled year when presence condition to be reached.
	 *	@param $arr_month - scheduled month.
	 *	@param $arr_day - schedluled day.
	 *	@param $arr_hour - scheduled hour.
	 *	Departure date & time parameters:
	 *	@param $dep_year - scheduled year when presence condition to be over.
	 *	@param $dep_month - scheduled month.
	 *	@param $dep_day - schedluled day.
	 *	@param $dep_hour - scheduled hour.
	 *
	 *	@url PUT /SetSchedule/$arr_year/$arr_month/$arr_day/$arr_hour/$dep_year/$dep_month/$dep_day/$dep_hour
	 */
	public function SetSchedule($arr_year, $arr_month, $arr_day, $arr_hour,
								$dep_year, $dep_month, $dep_day, $dep_hour)
	{
		$this->CheckDateTimeRange($arr_year, $arr_month, $arr_day, $arr_hour, 0);
		$this->CheckDateTimeRange($dep_year, $dep_month, $dep_day, $dep_hour, 0);
		
		$this->UpdateScheduleIni($arr_year, $arr_month, $arr_day, $arr_hour, $dep_year, $dep_month, $dep_day, $dep_hour);
		return $this->GetSchedule();
	}
	
	/**
	 *	Clears heating schedule settings so it would never be activated in the future.
	 *	@url PUT /ResetSchedule
	 */
	public function ResetSchedule()
	{
		$this->UpdateScheduleIni(1990, 1, 1, 0, 1990, 1, 1, 0);
		return $this->GetSchedule();		
	}
	
	/**
	 *	Return heating history hourly for the depth specified.
	 *
	 *	@param $days - history depth in days
	 *
	 *	@url GET /GetTempHistory/$days
	 */
	public function GetTempHistory($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 300)
			throw new RestException(400, "Invalid request parameter: $days.");
		
		global $conn;
		$time_zone = new DateTimeZone(TZ);
		
		$res = $conn->query(
			"SELECT DATE(time) as Date, HOUR(time) as Hour, AVG(external) as outTemp, AVG(bedroom) as inTemp " .
			"FROM heating " .
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
				"inTemp"	=> (float) $r["inTemp"],
				"outTemp" 	=> (float) $r["outTemp"]
			);
		}
		return $arr;		
	}
	
	/**
	 *	Return humidity history hourly for the depth specified.
	 *
	 *	@param $days - history depth in days
	 *
	 *	@url GET /GetHumidityHistory/$days
	 */
	public function GetHumidityHistory($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 300)
			throw new RestException(400, "Invalid request parameter: $days.");
		
		global $conn;
		$time_zone = new DateTimeZone(TZ);
		
		if ($days <= 2)
		{
			// all datapoints for shorter time periods
			$query = "SELECT DATE(time) as Date, bathroom " .
						"FROM humidity " .
						"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
						"ORDER BY DATE(time);"
		}
		else
		{
			// avg by hours for longer time periods
			$query = "SELECT DATE(time) as Date, HOUR(time) as Hour, AVG(bathroom) as bathroom " .
						"FROM humidity " .
						"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
						"GROUP BY HOUR(time), DATE(time) " .
						"ORDER BY DATE(time), HOUR(time);"
		}
		$res = $conn->query($query);
		
		$arr = array();
		while($r = $res->fetch_assoc())
		{
			$moment = DateTime::createFromFormat("Y-m-d", $r["Date"], $time_zone);
			$moment->setTime($r["Hour"], 0);
				
			$arr[] = array(
				"date" 		=> $moment->format(DateTime::ISO8601),
				"bathroom" 	=> (float) $r["bathroom"]
			);
		}
		return $arr;		
	}

	/**
	 *	Returns inside/outside min/avg/max values for the time period requested.
	 *
	 *	@param $days - period length from now to the past in days.
	 *
	 *	@url GET /GetTempStatistics/$days
	 */
	public function GetTempStatistics($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 1000)
			throw new RestException(400, "Invalid request parameter: $days");

		global $conn;
		
		$res = $conn->query(
			"SELECT MIN(external), AVG(external), MAX(external), MIN(control), AVG(control), MAX(control) " .
			"FROM heating WHERE time > DATE_SUB(NOW(), INTERVAL $days DAY);"
		);
		
		// $arr = array();
		if ($r = $res->fetch_assoc())
		{
			return array(
				"inside"	=> array(
					"min"	=> (float) $r["MIN(control)"],
					"avg"	=> (float) $r["AVG(control)"],
					"max"	=> (float) $r["MAX(control)"]
				),
				"outside"	=> array(
					"min"	=> (float) $r["MIN(external)"],
					"avg"	=> (float) $r["AVG(external)"],
					"max"	=> (float) $r["MAX(external)"]					
				)
			);
		}
		return null;
	}
	
	/**
	 *	Returns heating system electricity consumption for the time period requested.
	 *
	 *	@param $days - period length from now to the past in days.
	 *
	 *	@url GET /GetHeatingConsumption/$days
	 */
	public function GetHeatingConsumption($days)
	{
		if (!ctype_digit((string)$days) || $days < 1 || $days > 1000)
			throw new RestException(400, "Invalid request parameter: $days");

		$d = $days - 1;
		date_default_timezone_set("Europe/Moscow");
		$startDate = Date("Y-m-d", strtotime("-$d days"));
		$endDate = Date("Y-m-d", strtotime("+1 days"));

		return SQL2Array("CALL SP_HEATING_CONSUMPTION('$startDate', '$endDate');");
	}
	
	/**
	 *	Helper updating INI schedule section.
	 */
	private function UpdateScheduleIni($arr_year, $arr_month, $arr_day, $arr_hour,
									   $dep_year, $dep_month, $dep_day, $dep_hour)
	{
		global $controller_ini;
	    $controller_config = parse_ini_file($controller_ini, true);

		# DD.MM.YYYY
        $controller_config[schedule][arrive_date] = "$arr_day.$arr_month.$arr_year";
        $controller_config[schedule][arrive_hour] = $arr_hour;
        $controller_config[schedule][dep_date] = "$dep_day.$dep_month.$dep_year";
        $controller_config[schedule][dep_hour] = $dep_hour;
        
         write_ini_file($controller_ini, $controller_config);
	}
	
	/**
	 *	Check date time component ranges.
	 */
	private function CheckDateTimeRange($year, $month, $day, $hour, $minute)
	{
		if (!ctype_digit((string)$year) || $year < 2010 || $year > 2050)
		{
			throw new RestException(400, "Year: $year is out of the range.");
		}
		if (!ctype_digit((string)$month) || $month < 1 || $month > 12)
		{
			throw new RestException(400, "Month: $month is out of the range.");
		}
		if (!ctype_digit((string)$day) || $day < 1 || $day > 31)
		{
			throw new RestException(400, "Day: $day is out of the range.");
		}
		if (!ctype_digit((string)$hour) || $hour < 0 || $hour > 23)
		{
			throw new RestException(400, "Hour: $hour is out of the range.");
		}
		if (!ctype_digit((string)$minute) || $minute < 0 || $minute > 59)
		{
			throw new RestException(400, "Minute: $minute is out of the range.");
		}
	}
}
?>