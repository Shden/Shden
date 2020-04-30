<?php
require_once ('../../include/sql2js.php');

define(TZ, "MSK");

/**
 *	House climate API endpoint. This API is desginged to control heating
 * 	system parameters including different heating schedules for various
 *	house modes, schedules etc.
 *	Also it provides humidity data access methods.
 */
Class Climate
{
	const HTTP_BAD_REQUEST = 400;
	const HTTP_NOT_ACCEPTABLE = 406;

	// Fully qualified name of the configuration .json file.
	private function GetConfigurationFileName()
	{
		return
			$_SERVER['DOCUMENT_ROOT'] . "/../shc/config/heating.json";
	}

	/**
	 *	Return heating schedule information.
	 *
	 * 	@url GET /GetSchedule
	 */
	public function GetSchedule()
	{
		// Read JSON from file and decode into associative array
		$configurationStr = file_get_contents(
			$this->GetConfigurationFileName());
		$json = json_decode($configurationStr, true);

		$time_zone = new DateTimeZone(TZ);
		$arrival_date =
			new DateTime($json["schedule"]["arrival"], $time_zone);
		$departure_date =
			new DateTime($json["schedule"]["departure"], $time_zone);

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
	 *	@param $arr_year - scheduled year when presence starts.
	 *	@param $arr_month - scheduled presence month.
	 *	@param $arr_day - schedluled presence day.
	 *	@param $arr_hour - scheduled presence hour.
	 *	Departure date & time parameters:
	 *	@param $dep_year - scheduled year when presence is over.
	 *	@param $dep_month - scheduled month.
	 *	@param $dep_day - schedluled day.
	 *	@param $dep_hour - scheduled hour.
	 *
	 *	@url PUT /SetSchedule/$arr_year/$arr_month/$arr_day/$arr_hour/$dep_year/$dep_month/$dep_day/$dep_hour
	 */
	public function SetSchedule(
		$arr_year, $arr_month, $arr_day, $arr_hour,
		$dep_year, $dep_month, $dep_day, $dep_hour)
	{
		$this->CheckDateTimeRange(
			$arr_year, $arr_month, $arr_day, $arr_hour, 0);
		$this->CheckDateTimeRange(
			$dep_year, $dep_month, $dep_day, $dep_hour, 0);

		$this->UpdateScheduleConfig(
			$arr_year, $arr_month, $arr_day, $arr_hour,
			$dep_year, $dep_month, $dep_day, $dep_hour);

		return $this->GetSchedule();
	}

	/**
	 *	Clears heating schedule settings so it would never be activated in the future.
	 *	@url PUT /ResetSchedule
	 */
	public function ResetSchedule()
	{
		$this->UpdateScheduleConfig(1990, 1, 1, 0, 1990, 1, 1, 0);
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
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid request parameter: $days.");

		global $conn;
		$time_zone = new DateTimeZone(TZ);

		$res = $conn->query(
			"SELECT DATE(time) as Date, HOUR(time) as Hour, " .
			"AVG(external) as outTemp, (AVG(bedroom) + AVG(kitchen)) / 2 as inTemp, " .
			"AVG(bedroom) as bedroom, AVG(kitchen) as kitchen, " .
			"AVG(fluid_in) as heaterIn, AVG(fluid_out) as heaterOut, " .
			"AVG(sauna_floor) as saunaFloor " .
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
				"outTemp" 	=> (float) $r["outTemp"],
				"heaterIn"	=> (float) $r["heaterIn"],
				"heaterOut"	=> (float) $r["heaterOut"],
				"saunaFloor"	=> (float) $r["saunaFloor"],
				"bedroom"	=> (float) $r["bedroom"],
				"kitchen"	=> (float) $r["kitchen"]
			);
		}
		$res->free();

		return $arr;
	}


	/**
	 *	ESP autonomous temperature sensor data feed endpoint.
	 *	This will eventually replace PostHeatingDataPoint($data)
	 *
	 *	Curl positive test:
	 *
	 *	curl -X POST http://localhost/API/1.1/climate/data/temperature --data '[{ "temperature" : 21.5, "sensorId": "28FF72BF47160342" }]'
	 *
	 *	@url POST /data/temperature
	 */
	public function PostTemperatureData($data)
	{
		global $conn;

		foreach ($data as $sensorInfo)
		{
			// Data validation
			if (!is_numeric($sensorInfo->temperature) ||
				($sensorInfo->temperature < -50.0) ||
				($sensorInfo->temperature > 120.0))
			{
				throw new RestException(self::HTTP_BAD_REQUEST,
					"Invalid temperature: $sensorInfo->temperature.");
			}

			if (!array_key_exists("sensorId", $sensorInfo))
				throw new RestException(self::HTTP_BAD_REQUEST,
					"No sensor ID provided");

			if (!$conn->query("CALL SP_UPDATE_SENSOR('$sensorInfo->sensorId', $sensorInfo->temperature);"))
				throw new RestException(self::HTTP_NOT_ACCEPTABLE,
					$conn->error);
		}
	}

	/**
	 *	Report heating data point.
	 *	Data point information is posted in JSON by shc/heating.js
	 *
	 *	Will deprecate after migrated to new ESP temperature sensors.
	 *
	 *	Curl positive test:
	 *
	 *	curl -X POST http://localhost/API/1.1/climate/data/heating --data '{ "heater" : 42.5, "fluid_in" : 38.62, "fluid_out" : 40.8, "external" : 8.2, "am_bedroom" : 19, "bedroom" : 20, "cabinet" : 21, "child_bedroom" : 22, "kitchen" : 23, "bathroom_1" : 24, "control" : 20, "bathroom_1_floor" : 28, "heating" : 0, "pump" : 1, "bathroom_1_heating" : 1 }'
	 *
	 *	@url POST /data/heating
	 */
	public function PostHeatingDataPoint($data)
	{
		// Data validation
		if (!is_numeric($data->heater))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid heater temperature: $data->heater.");
		if (!is_numeric($data->fluid_in))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid incoming fluid temperature: $data->fluid_in.");
		if (!is_numeric($data->fluid_out))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid outgoing fluid temperature: $data->fluid_out.");
		if (!is_numeric($data->external))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid external temperature: $data->external.");
		if (!is_numeric($data->am_bedroom))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid am_bedroom temperature: $data->am_bedroom.");
		if (!is_numeric($data->bedroom))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid bedroom temperature: $data->bedroom.");
		if (!is_numeric($data->cabinet))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid cabinet temperature: $data->cabinet.");
		if (!is_numeric($data->child_bedroom))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid child_bedroom temperature: $data->child_bedroom.");
		if (!is_numeric($data->kitchen))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid kitchen temperature: $data->kitchen.");
		if (!is_numeric($data->bathroom_1))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid bathroom_1 temperature: $data->bathroom_1.");
		if (!is_numeric($data->control))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid control temperature: $data->control.");
		if (!is_numeric($data->bathroom_1_floor))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid bathroom_1_floor temperature: $data->bathroom_1_floor.");
		if (!is_numeric($data->heating) ||
			($data->heating != 0 && $data->heating != 1))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid heating state: $data->heating.");
		if (!is_numeric($data->pump) ||
			($data->pump != 0 && $data->pump != 1))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid pump state: $data->pump.");
		if (!is_numeric($data->bathroom_1_heating) ||
			($data->bathroom_1_heating != 0 && $data->bathroom_1_heating != 1))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid bathroom_1_heating state: $data->bathroom_1_heating.");

		global $conn;

		if (!$conn->query("CALL SP_ADD_HEATING_RECORD(" .
			"$data->heater, $data->fluid_in, $data->fluid_out, " .
			"$data->external, $data->am_bedroom, $data->bedroom, " .
			"$data->cabinet, $data->child_bedroom, " .
			"$data->kitchen, $data->bathroom_1, " .
			"$data->bathroom_1_floor, $data->control, " .
			"$data->heating, $data->pump, " .
			"$data->bathroom_1_heating);"))
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"DB error: " . $conn->error);
		}
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
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid request parameter: $days.");

		global $conn;
		$time_zone = new DateTimeZone(TZ);

		if ($days <= 2)
		{
			// all datapoints for shorter time periods
			$query = "SELECT DATE(time) as Date, HOUR(time) as Hour, MINUTE(time) as Minute, bathroom " .
						"FROM humidity " .
						"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
						"ORDER BY time;";
		}
		else
		{
			// avg by hours for longer time periods
			$query = "SELECT DATE(time) as Date, HOUR(time) as Hour, 0 as Minute, AVG(bathroom) as bathroom " .
						"FROM humidity " .
						"WHERE time > DATE_ADD(NOW(), INTERVAL -$days DAY) " .
						"GROUP BY HOUR(time), DATE(time) " .
						"ORDER BY DATE(time), HOUR(time);";
		}
		$res = $conn->query($query);

		$arr = array();
		while($r = $res->fetch_assoc())
		{
			$moment = DateTime::createFromFormat("Y-m-d", $r["Date"], $time_zone);
			$moment->setTime($r["Hour"], $r["Minute"]);

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
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid request parameter: $days");

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
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Invalid request parameter: $days");

		$d = $days - 1;
		date_default_timezone_set("Europe/Moscow");
		$startDate = Date("Y-m-d", strtotime("-$d days"));
		$endDate = Date("Y-m-d", strtotime("+1 days"));

		return SQL2Array("CALL SP_HEATING_CONSUMPTION('$startDate', '$endDate');");
	}

	/**
	 *	Helper updating contoller schedule section.
	 */
	private function UpdateScheduleConfig(
		$arr_year, $arr_month, $arr_day, $arr_hour,
		$dep_year, $dep_month, $dep_day, $dep_hour)
	{
		$time_zone = new DateTimeZone(TZ);
		$arrival = new DateTime(now, $time_zone);
		$arrival->setDate($arr_year, $arr_month, $arr_day);
		$arrival->setTime($arr_hour, 0);

		$departure = new DateTime(now, $time_zone);
		$departure->setDate($dep_year, $dep_month, $dep_day);
		$departure->setTime($dep_hour, 0);

		// Read JSON from file and decode into associative array
		$configFileName = $this->GetConfigurationFileName();
		$configurationStr = file_get_contents($configFileName);
		$json = json_decode($configurationStr, true);

		# DD.MM.YYYY
		$json["schedule"]["arrival"] = $arrival->format('Y-m-d H:i:s');
		$json["schedule"]["departure"] = $departure->format('Y-m-d H:i:s');

		file_put_contents($configFileName, json_encode($json, JSON_PRETTY_PRINT));
	}

	/**
	 *	Check date time component ranges.
	 */
	private function CheckDateTimeRange($year, $month, $day, $hour, $minute)
	{
		if (!ctype_digit((string)$year) || $year < 2010 || $year > 2050)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Year: $year is out of the range.");
		}
		if (!ctype_digit((string)$month) || $month < 1 || $month > 12)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Month: $month is out of the range.");
		}
		if (!ctype_digit((string)$day) || $day < 1 || $day > 31)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Day: $day is out of the range.");
		}
		if (!ctype_digit((string)$hour) || $hour < 0 || $hour > 23)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Hour: $hour is out of the range.");
		}
		if (!ctype_digit((string)$minute) || $minute < 0 || $minute > 59)
		{
			throw new RestException(self::HTTP_BAD_REQUEST,
				"Minute: $minute is out of the range.");
		}
	}

	/**
	 * Return heating configuration.
	 *
	 * @url GET /Configuration
	 */
	public function GetConfiguration()
	{
		// Read JSON from configuration file
		$configurationStr = file_get_contents(
			$this->GetConfigurationFileName());
		$json = json_decode($configurationStr, true);

		return $json;
	}

	/**
	 * Update heating configuration data.
	 *
	 * @url PUT /Configuration
	 */
	public function PutConfiguration($data)
	{
		if (!array_key_exists("heating", $data))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"No heating section");

		if (!array_key_exists("schedule", $data))
			throw new RestException(self::HTTP_BAD_REQUEST,
				"No schedule section");

		// Possibly more validation to go here.

		file_put_contents(
			$this->GetConfigurationFileName(),
			json_encode($data, JSON_PRETTY_PRINT));
	}

	/**
	 *	Turn on bath ventilation for a period of time.
	 *
	 *	@param duration - time (minutes) for ventilation.
	 *
	 *	@url PUT /SetBathVentilationOn/$duration
	 */
	public function SetBathVentilationOn($duration)
	{
		// so far just set it on until next controller run
		`echo 1 >> /home/den/Shden/appliances/bathVentilationSwitch`;
		return 1;
	}

	/**
	 * 	Get floor heating state for all areas.
	 * 
	 * 	@url GET /FloorHeatingState
	 */
	public function GetFloorHeatingState()
	{
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_URL, "http://192.168.1.120/status");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		
		$result = curl_exec($curl);

		curl_close($curl);

		return $result;

	}
}
?>
