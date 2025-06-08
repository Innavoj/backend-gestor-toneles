
const express = require('express');
const router = express.Router();
const tonelController = require('../controllers/tonelController');

// GET all tonel
router.get('/', tonelController.getAllToneles);

// POST a new tonel
router.post('/', tonelController.createTonel);

// GET a single tonel by ID
router.get('/:idtonel', tonelController.getTonelById);

// PUT update a tonel by ID
router.put('/:idtonel', tonelController.updateTonel);

// PUT update a tonel Status Location by ID
router.put('/status/:idtonel', tonelController.updateTonelStatusLocation);

// DELETE a tonel by ID
router.delete('/:idtonel', tonelController.deleteTonel);

module.exports = router;
