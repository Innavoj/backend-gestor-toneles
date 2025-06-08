const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

// GET all products
router.get('/', lotesController.getAllLotes);

// POST a new product
router.post('/', lotesController.createLotes);

// GET a single product by ID
router.get('/:idlote', lotesController.getLotesById);

// PUT update a product by ID
router.put('/:idlote', lotesController.updateLotes);

// DELETE a product by ID
router.delete('/:idlote', lotesController.deleteLotes);

module.exports = router;