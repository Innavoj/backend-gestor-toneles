
const express = require('express');
const router = express.Router();
const eventostonelController = require('../controllers/eventostonelController');

// GET all products
router.get('/', eventostonelController.getAllEventostonel);

// POST a new product
router.post('/', eventostonelController.createEventostonel);

// GET a single product by ID
//router.get('/:idevento', eventostonelController.getEventostonelById);
router.get('/:idtonel', eventostonelController.getEventostonelById);
// PUT update a product by ID
router.put('/:idevento', eventostonelController.updateEventostonel);

// DELETE a product by ID
router.delete('/:idevento', eventostonelController.deleteEventostonel);

module.exports = router;
