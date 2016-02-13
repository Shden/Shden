<?php

/** 
 *	House lighting API endpoint. This API is desginged to control lighting on/off, status etc.
 */	
Class Lighting
{
	/**
	 *	Return lighting status for all appliances connected to the system.
	 *
	 *	@url GET /GetStatus
	 */
	public function GetStatus()
	{
		$streetLight250Status = (int)`cat /home/den/Shden/appliances/streetLight250`;
		$streetLight150Status = (int)`cat /home/den/Shden/appliances/streetLight150`;
		$balkonLightStatus    = (int)`cat /home/den/Shden/appliances/balkonLight`;

		return array(
					"streetLight250" => $streetLight250Status,
					"streetLight150" => $streetLight150Status,
					"balkonLight"	 => $balkonLightStatus
				);		
	}
	
	/**
	 *	Update specific appliance status.
	 *
	 *	@param $applianceName - name (aliace, not physical address) of the appliance to change status.
	 *	@param $newStatus - status to set for the appliance.
	 *
	 *	@url PUT /ChangeStatus/$applianceName/$newStatus
	 */
	public function ChangeStatus($applianceName, $newStatus)
	{
		`echo $newStatus >> /home/den/Shden/appliances/$applianceName`;
		return $this->GetStatus();
	}
}

?>