async function GetStatus()
{
        return require('../models/gatewaysStatus.json');
}

exports.GetStatus = GetStatus;