<?php
require_once ('../../include/db.inc');

use Jacwright\RestServer\RestException;

/**
 *	Repellers control API endpoint.
 *	This is to control rodents repeller(s) in the house.
 */
Class Repellers
{
	/**
	 *	Returns repeller switch status for all devices connected.
	 *
	 *	@url GET /GetStatus
	 */
	public function GetStatus()
	{
		$kitchenRepellerStatus =
			(int)`cat /home/den/Shden/appliances/rodentsRepellerSwitch`;

		return array(
			"kitchen" => $kitchenRepellerStatus
		);
	}

	/**
	 *	Update repeller switch states.
	 *
	 *	@param $newStatus - status to set switch.
	 *
	 *	@url PUT /SetStatus/$newStatus
	 */
	public function SetStatus($newStatus)
	{
		if ($newStatus == 0 || $newStatus == 1)
		{
			`echo $newStatus >> /home/den/Shden/appliances/rodentsRepellerSwitch`;
			return $this->GetStatus();
		}
		else
			throw new RestException(400, 'Invalid repellers status.');
	}

	/**
	 *	Endpoint to refresh status from persisten state (DB).
	 *	This will be called by cron regularly to make sure
	 *	switch restored after power outage:
	 *
	 *	$ curl localhost/API/1.1/repellers/RefreshPulse
	 *
	 *	@url GET /RefreshPulse
	 */
	public function RefreshPulse()
	{
		global $conn;

		$res = $conn->query("SELECT isin FROM presence ORDER BY time desc LIMIT 1;");
		if ($r = $res->fetch_assoc())
		{
			$isin = (integer)$r["isin"];
			if ($isin == 1)
			{
				$this->SetStatus(0);
			}
			else
			{
				$this->SetStatus(1);
			}

			return 1;
		}
		return 0;
	}
}

?>
