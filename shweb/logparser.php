<?php
/**
 * Controller log file parser
 */
class LogParser
{
    private $iFileName='';
    /**
     * Constructor for the parser class
     *
     * @param mixed $aFileName  Log file to read
     * @return LogParser
     */
    function __construct($aFileName) 
	{
       	$this->iFileName = $aFileName;
    }
    /**
     * Get line without trailing "\n"
     *
     * @param mixed $fp Filepointer
     * @return string Read line without trailing "\n"
     */
    function GetLine($fp) 
	{
        $s = fgets($fp);
        return substr($s,0,strlen($s)-1);
    }
    /**
     * Get temperature graph statistics from the parsed log file
     *
     * @param $dateFrom - starting date
	 * @parem $dateTo - final date
     * @return array with temperature measures
     */
    function GetStat($dateFrom, $dateTo) 
	{
        $fp = fopen($this->iFileName,'r');
        if ($fp === false) 
		{
            JpGraphError::Raise('Cannot read log file');
        }

		$time = array();
		$outside = array();
		$bedroom = array();
		$influid = array();
		$outfluid = array();
		$i = 0;
        // Loop through all lines in the file 
		// Line pattern:
		//13/11/2011 12:59:05|46.00|23.25|47.06||4.25||22.75|19.19|16.94|16.88|26.69||19.19||1|1||P|D|20.0|12/11/2011 13:23:34
        while (!feof($fp)) 
		{
			$line = $this->GetLine($fp);
			$tokens = explode("|", $line);
			if (count($tokens) > 1)
			{
				$tstokens = explode(" ", $tokens[0]);
				$dateTokens = explode("/", $tstokens[0]);
				$timeTokens = explode(":", $tstokens[1]);

				$timeStamp = mktime(
					$timeTokens[0], $timeTokens[1], $timeTokens[2],
					$dateTokens[1], $dateTokens[0], $dateTokens[2]);
				if ($timeStamp >= $dateFrom && $timeStamp <= $dateTo)
				{
					$time[$i] = $tokens[0]; //$timestamp;
					$outside[$i] = $tokens[5];
					$influid[$i] = $tokens[3];
					$outfluid[$i] = $tokens[2];
					$bedroom[$i] = $tokens[8];
					$i++;
				}
			}
		}
		fclose($fp);

		return array($time, $outside, $influid, $outfluid, $bedroom);
	}
	function GetSummaryDaily($dateFrom, $dateTo)
	{
        $fp = fopen($this->iFileName,'r');
        if ($fp === false) 
		{
            JpGraphError::Raise('Cannot read log file');
        }
		$result = array();

		// Line pattern:
		//13/11/2011 12:59:05|46.00|23.25|47.06||4.25||22.75|19.19|16.94|16.88|26.69||19.19||1|1||P|D|20.0|12/11/2011 13:23:34
       	while (!feof($fp)) 
		{
			$line = $this->GetLine($fp);
			$tokens = explode("|", $line);
			if (count($tokens) > 1)
			{
				$tstokens = explode(" ", $tokens[0]);
				$dateTokens = explode("/", $tstokens[0]);
				$timeTokens = explode(":", $tstokens[1]);

				$timeStamp = mktime(
					$timeTokens[0], $timeTokens[1], $timeTokens[2],
					$dateTokens[1], $dateTokens[0], $dateTokens[2]);
				if ($timeStamp >= $dateFrom && $timeStamp <= $dateTo)
				{
					$date = trim($tstokens[0]);
					/*if (!in_array($date, $result))
					{
						echo "!";
						$result[$date] = array();
						$result[$date]["date"] = $date;
						$result[$date]["count"] = 0;
					}*/
					$outside = $tokens[5];
					$inside = $tokens[8];
					//$presence = $tokens[18];
					$saving = $tokens[19];
					$heating = $tokens[15];

					// outside (sum for avg, min, max
					$result[$date]["outside"] += $outside;
					if ($result[$date]["outside_min"] == null || $result[$date]["outside_min"] > $outside)
						$result[$date]["outside_min"] = $outside;
					if ($result[$date]["outside_max"] == null || $result[$date]["outside_max"] < $outside)
						$result[$date]["outside_max"] = $outside;

					$result[$date]["inside"] += $inside;
					$result[$date]["total"] += $heating;
					if ($saving == "N")					
						$result[$date]["night"] += $heating;
					$result[$date]["count"] += 1;
				}
			}
		}
		fclose($fp);

		return $result;
	}
}
?>
