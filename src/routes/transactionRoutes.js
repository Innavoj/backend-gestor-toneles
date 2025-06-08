
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET all transactions (with filtering)
router.get('/', transactionController.getAllTransactions);

// POST a new transaction
router.post('/', transactionController.createTransaction);

// GET a single transaction by ID
router.get('/:id', transactionController.getTransactionById);

// PUT update a transaction by ID
router.put('/:id', transactionController.updateTransaction);

// PATCH mark a transaction as paid
router.patch('/:id/mark-as-paid', transactionController.markTransactionAsPaid);

// DELETE a transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
