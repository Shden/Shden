<?php
#require_once '../../include/ini.php';

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
		$controller_ini = $_SERVER['DOCUMENT_ROOT'] . "/../shc/heating_config/controller.ini";
		$controller_config = parse_ini_file($controller_ini, true);
		
		$arrival_segments = explode(".", $controller_config[schedule][arrive_date]);
		$departure_segments = explode(".", $controller_config[schedule][dep_date]);
		
		$time_zone = new DateTimeZone("MSK");
		$arrival_date = new DateTime(now, $time_zone);
		$departure_date = new DateTime(now, $time_zone);
		$arrival_date->setDate($arrival_segments[2], $arrival_segments[1], $arrival_segments[0]);
		$departure_date->setDate($departure_segments[2], $departure_segments[1], $departure_segments[0]);
		$arrival_date->setTime($controller_config[schedule][arrive_hour], 0);
		$departure_date->setTime($controller_config[schedule][dep_hour], 0);
		
		return array(
					"arr" => array (
						"day" 	=> (int)$arrival_segments[0],
						"month" => (int)$arrival_segments[1],
						"year" 	=> (int)$arrival_segments[2],
						"hour" 	=> (int)$controller_config[schedule][arrive_hour],
						"min"	=> 0
					),
					"dep" => array (
						"day" 	=> (int)$departure_segments[0],
						"month" => (int)$departure_segments[1],
						"year" 	=> (int)$departure_segments[2],
						"hour" 	=> (int)$controller_config[schedule][dep_hour],
						"min"	=> 0
					),
					"from" 	=> $arrival_date->format(DateTime::ISO8601),
					"to" => $departure_date->format(DateTime::ISO8601)
				);
	}
}
?>