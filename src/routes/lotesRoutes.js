const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

// GET all lote
router.get('/', lotesController.getAllLotes);

// POST a new lote
router.post('/', lotesController.createLotes);

// GET a single lote by ID
router.get('/:idlote', lotesController.getLotesById);

// GET a single lote by IDTonel
router.get('/tonel/:idtonel', lotesController.getLotesByIdTonel);

// PUT update a lote by ID
router.put('/:idlote', lotesController.updateLotes);

// DELETE a lote by ID
router.delete('/:idlote', lotesController.deleteLotes);

module.exports = router;