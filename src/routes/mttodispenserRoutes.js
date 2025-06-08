const express = require('express');
const router = express.Router();
const mttodispenserController = require('../controllers/mttodispenserController');

// GET all mtto
router.get('/', mttodispenserController.getAllmttodispenser);

// POST a new mtto
router.post('/', mttodispenserController.createmttodispenser);

// GET a single mtto by ID
router.get('/:idmtto', mttodispenserController.getmttodispenserById);

// PUT update a mtto by ID
router.put('/:idmtto', mttodispenserController.updatemttodispenser);

// DELETE a mtto by ID
router.delete('/:idmtto', mttodispenserController.deletemttodispenser);

module.exports = router;