const express = require('express');
const router = express.Router();
const HTTPStatus = require('http-status-codes').StatusCodes;
const Gateways = require('../services/gateways');

/**
 *	Open gateway.
 *
 *	:gatewayName - name of the gateway to open.
 *
 *	PUT /Open/:gatewayName
 */
router.put('/Open/:gatewayName', async function(req, res)
{
        let gatewayName = req.params.gatewayName;

        if (gatewayName != "gateA") 
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid gateway name requested: (${gatewayName}).`);
                return;
        }

        res.json(await Gateways.Open(gatewayName));
});

/**
 *	Close gateway.
 *
 *	:gatewayName - name of the gateway to close.
 *
 *	PUT /Close/:gatewayName
 */
router.put('/Close/:gatewayName', async function(req, res)
{
        let gatewayName = req.params.gatewayName;

        if (gatewayName != "gateA") {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid gateway name requested: (${gatewayName}).`);
                return;
        }

        res.json(await Gateways.Close(gatewayName));
});

 module.exports = router;