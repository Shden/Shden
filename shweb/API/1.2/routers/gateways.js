const express = require('express');
const router = express.Router();
const HTTPStatus = require('http-status-codes').StatusCodes;
const Gateways = require('../services/gateways');

/**
 *	Returns gateway status for all gateways connected.
 *
 *	GET /GetStatus
 */
router.get('/GetStatus', async function(req, res) 
{
        res.json(await Gateways.GetStatus());
});

/**
 *	Change selected gateway position.
 *
 *	:gatewayName - name (alias, not physical address) of the gateway to change position.
 *	:newPosition - position to move gateway to.
 *
 *	PUT /Move/:gatewayName/:newPosition
 */
router.put('/Move/:gatewayName/:newPosition', async function(req, res)
{
        let gatewayName = req.params.gatewayName;
        let newPosition = req.params.newPosition;

        if (isNaN(newPosition) || (newPosition != 0 && newPosition != 1)) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid gate postiion requested: (${newPosition}).`);
                return;
        }

        // Not implemented yet.

        // Finally return new status
        res.json(await Gateways.GetStatus());
});

module.exports = router;