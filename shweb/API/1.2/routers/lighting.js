const express = require('express');
const router = express.Router();
const Lighting = require('../services/lighting');

const HTTP_BAD_REQUEST = 400;

/**
 *	Returns lighting status for all appliances connected to the system.
 *
 *	GET /GetStatus
 */
router.get('/GetStatus', async function(req, res) 
{
        let lightingStatus = await Lighting.GetStatus();
        res.json(lightingStatus);
});

/**
 *	Update specific appliance status.
 *
 *	:applianceName - name (aliace, not physical address) of the appliance to change status.
 *	:newStatus - status to set for the appliance.
 *
 *	PUT /ChangeStatus/:applianceName/:newStatus
 */
router.put('/ChangeStatus/:applianceName/:newStatus', async function(req, res) 
{
        let applianceName = req.params.applianceName;
        let newStatus = req.params.newStatus;

        if (newStatus != 1 && newStatus != 0)
        {
                res.status(HTTP_BAD_REQUEST).send(`Invalid status requested (${newStatus}).`);
                return;
        }

        if (applianceName.length < 3 || applianceName.length > 15)
        {
                res.status(HTTP_BAD_REQUEST).send(`Invalid appliance name (${applianceName}).`);
                return;
        }

        let updatedStatus = await Lighting.UpdateStatus(applianceName, newStatus);
        res.json(updatedStatus);
});

module.exports = router;