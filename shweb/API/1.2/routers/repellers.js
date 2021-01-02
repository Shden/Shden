const express = require('express');
const router = express.Router();
const Repellers = require('../services/repellers');
const HTTPStatus = require('http-status-codes').StatusCodes;

/**
 *	Returns repeller switch status for all devices connected.
 *
 *	GET /GetStatus
 */
router.get('/GetStatus', async function(req, res)
{
        res.json(await Repellers.GetStatus());
});

/**
 *	Update repeller switch states.
 *
 *	:newStatus - status to set switch.
 *
 *	PUT /SetStatus/:newStatus
 */
router.put('/SetStatus/:newStatus', async function(req, res)
{
        let newStatus = req.params.newStatus;
        if (isNaN(newStatus) || ((newStatus != 0) && (newStatus != 1)))
        {
                res.status(HTTPStatus.BAD_REQUEST).send('Invalid repellers status requested.');
                return;
        }

        res.json(await Repellers.SetStatus(newStatus));
});

module.exports = router;