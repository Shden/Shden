const express = require('express');
const router = express.Router();
const Relays = require('../services/relays');
const HTTPStatus = require('http-status-codes').StatusCodes;

/**
 *	Return complete relays state information.
 *
 *	GET /State
 */
router.get('/State', async function(req, res) {

        let shuttersStatus = await Relays.GetRelaysState();
        res.json(shuttersStatus);
});

/**
 *	Update relays state.
 *
 *	PUT /State
 */
router.put('/State', async function(req, res) {

        let stateUpdate = req.body;
        if (stateUpdate.Relays === undefined) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send('Invalid state requested.');
                return;
        }

        let updateResult = await (Relays.UpdateState(stateUpdate));
        res.json(updateResult.Relays);
});

module.exports = router;