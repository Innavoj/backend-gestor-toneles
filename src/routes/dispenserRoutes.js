
const express = require('express');
const router = express.Router();
const dispenserController = require('../controllers/dispenserController');

// GET all products
router.get('/', dispenserController.getAllDispenser);

// POST a new product
router.post('/', dispenserController.createDispenser);

// GET a single product by ID
router.get('/:iddispensador', dispenserController.getDispenserById);

// PUT update a product by ID
router.put('/:iddispensador', dispenserController.updateDispenser);

// DELETE a product by ID
router.delete('/:iddispensador', dispenserController.deleteDispenser);

module.exports = router;
