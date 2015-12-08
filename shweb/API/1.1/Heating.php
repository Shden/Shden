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
		
		$arrival_date = explode(".", $controller_config[schedule][arrive_date]);
		$departure_date = explode(".", $controller_config[schedule][dep_date]);
		
		return array(
					"arrival" => array (
						"day" 	=> (int)$arrival_date[0],
						"month" => (int)$arrival_date[1],
						"year" 	=> (int)$arrival_date[2],
						"hour" 	=> (int)$controller_config[schedule][arrive_hour],
						"min"	=> 0
					),
					"departure" => array (
						"day" 	=> (int)$departure_date[0],
						"month" => (int)$departure_date[1],
						"year" 	=> (int)$departure_date[2],
						"hour" 	=> (int)$controller_config[schedule][dep_hour],
						"min"	=> 0
					)
				);
	}
}
?>