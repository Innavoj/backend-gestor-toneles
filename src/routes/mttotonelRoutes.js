const express = require('express');
const router = express.Router();
const mttotonelController = require('../controllers/mttotonelController');

// GET all mtto
router.get('/', mttotonelController.getAllmttotonel);

// POST a new mtto
router.post('/', mttotonelController.createmttotonel);

// GET a single mtto by ID
router.get('/:idmtto', mttotonelController.getmttotonelById);

// PUT update a mtto by ID
router.put('/:idmtto', mttotonelController.updatemttotonel);

// DELETE a mtto by ID
router.delete('/:idmtto', mttotonelController.deletemttotonel);

module.exports = router;