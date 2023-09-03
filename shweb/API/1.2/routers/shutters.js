const express = require('express');
const router = express.Router();
const Relays = require('../services/relays');
const HTTPStatus = require('http-status-codes').StatusCodes;

/**
 *	Return shutters state information.
 *
 *	GET /State
 */
 router.get('/State', async function(req, res) {

        let shuttersStatus = await Relays.GetShuttersState();
        res.json(shuttersStatus);
});

/**
 *	Update shutters state.
 *
 *	PUT /State
 */
 router.put('/State', async function(req, res) {

        let stateUpdate = req.body;
        if (stateUpdate.Shutters === undefined) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send('Invalid state requested.');
                return;
        }

        res.json(await Relays.UpdateState(stateUpdate));
});

module.exports = router;