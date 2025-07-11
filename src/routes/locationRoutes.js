
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET all tonel
router.get('/', locationController.getAllLocation);

// POST a new tonel
router.post('/', locationController.createLocation);

// GET a single tonel by ID
router.get('/:idlocation', locationController.getLocationById);

// PUT update a tonel by ID
router.put('/:idlocation', locationController.updateLocation);


// DELETE a tonel by ID
router.delete('/:idlocation', locationController.deleteLocation);

module.exports = router;
