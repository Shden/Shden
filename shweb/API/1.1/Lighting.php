<?php

/**
 *	House lighting API endpoint. This API is desginged to control lighting on/off, status etc.
 */
Class Lighting
{
	/**
	 *	Returns lighting status for all appliances connected to the system.
	 *
	 *	@url GET /GetStatus
	 */
	public function GetStatus()
	{
		$streetLight250Status = (int)`cat /home/den/Shden/appliances/streetLight250`;
		$streetLight150Status = (int)`cat /home/den/Shden/appliances/streetLight150`;
		$balkonLightStatus    = (int)`cat /home/den/Shden/appliances/balkonLight`;
		$fenceLight	      = (int)`cat /home/den/Shden/appliances/fenceLight`;

		return array(
					"streetLight250" => $streetLight250Status,
					"streetLight150" => $streetLight150Status,
					"balkonLight"	 => $balkonLightStatus,
					"fenceLight"	 => $fenceLight
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
		if (!strpbrk($applianceName, './\\') && strlen($applianceName) < 15)
		{
			`echo $newStatus >> /home/den/Shden/appliances/$applianceName`;
			return $this->GetStatus();
		}
		else
			throw new RestException(400, 'Invalid appliance name.');
	}
}

?>
