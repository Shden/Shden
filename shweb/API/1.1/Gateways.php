<?php

/**
 *	Gateways control API endpoint.
 *	This is to open and close gateways to get to parking space and the
 *	territory around the house.
 */
Class Gateways
{
	/**
	 *	Returns gateway status for all gateways connected.
	 *
	 *	@url GET /GetStatus
	 */
	public function GetStatus()
	{
		// Hardcoded so far.
		return array(
			"parking"	=> 0,
			"territory"	=> 0
		);
	}

	/**
	 *	Change selected gateway position.
	 *
	 *	@param $gatewayName - name (alias, not physical address) of
	 *		the gateway to change position.
	 *	@param $newPosition - position to move gateway to.
	 *
	 *	@url PUT /Move/$gatewayName/$newPosition
	 */
	public function Move($gatewayName, $newPosition)
	{
		// Not implemented yet.

		// Finally return new status
		return $this->GetStatus();
	}
}

?>
