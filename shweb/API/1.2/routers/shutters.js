const express = require('express');
const router = express.Router();
const Shutters = require('../services/shutters');
const HTTPStatus = require('http-status-codes').StatusCodes;

/**
 *	Return shutters state information.
 *
 *	GET /State
 */
router.get('/State', async function(req, res) {

        let shuttersStatus = await Shutters.GetShuttersState();
        res.json(shuttersStatus);
});

/**
 *	Update shutters state.
 *
 *	PUT /State
 */
router.put('/State', async function(req, res) {

        let stateUpdate = req.body;
        if (stateUpdate.shutters === undefined) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send('Invalid state requested.');
                return;
        }

        res.json(await Shutters.UpdateShuttersState(stateUpdate));
});

module.exports = router;