
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper to update stock
const updateProductStock = async (productId, quantityChange, connection) => {
  const db = connection || pool; // Use provided connection (for transactions) or default pool
  const [productRows] = await db.query('SELECT stock FROM products WHERE id = ?', [productId]);
  if (productRows.length === 0) {
    throw new Error('Product not found for stock update.');
  }
  const currentStock = productRows[0].stock;
  const newStock = currentStock + quantityChange;
  if (newStock < 0) {
      throw new Error('Insufficient stock for this operation.');
  }
  await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
};

// GET all transactions (with filtering)
exports.getAllTransactions = async (req, res, next) => {
  try {
    // Basic filtering example (can be expanded)
    const { type, category, startDate, endDate, status, productId, sortBy = 'date', sortOrder = 'DESC' } = req.query;
    let query = 'SELECT t.*, p.name as productName FROM transactions t LEFT JOIN products p ON t.productId = p.id WHERE 1=1';
    const queryParams = [];

    if (type) {
      query += ' AND t.type = ?';
      queryParams.push(type);
    }
    if (category) {
      query += ' AND t.category = ?';
      queryParams.push(category);
    }
    if (startDate) {
      query += ' AND t.date >= ?';
      queryParams.push(startDate);
    }
    if (endDate) {
      query += ' AND t.date <= ?';
      queryParams.push(endDate);
    }
    if (status) {
      if (status === 'overdue') {
         query += ' AND t.status = ? AND t.dueDate < CURDATE()';
         queryParams.push('pending');
      } else {
        query += ' AND t.status = ?';
        queryParams.push(status);
      }
    }
    if (productId) {
      query += ' AND t.productId = ?';
      queryParams.push(productId);
    }
    
    // Validate sortBy column to prevent SQL injection
    const allowedSortBy = ['date', 'amount', 'category', 'type', 'description', 'status', 'dueDate'];
    if (allowedSortBy.includes(sortBy)) {
      query += ` ORDER BY t.${sortBy} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}`;
    } else {
      query += ` ORDER BY t.date DESC`; // Default sort
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new transaction
exports.createTransaction = async (req, res, next) => {
  const { type, date, description, amount, category, productId, quantity, dueDate } = req.body;
  const id = uuidv4();

  if (!type || !date || !description || amount === undefined || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero.' });
  }
  if (productId && (quantity === undefined || quantity <=0)) {
    return res.status(400).json({ message: 'Quantity must be greater than zero if product is selected.'});
  }


  let transactionStatus = dueDate ? 'pending' : 'paid';
  let paymentDate = transactionStatus === 'paid' ? date : null;

  const connection = await pool.getConnection(); // For DB transaction
  try {
    await connection.beginTransaction();

    const query = 'INSERT INTO transactions (id, type, date, description, amount, category, productId, quantity, dueDate, status, paymentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await connection.query(query, [id, type, date, description, amount, category, productId || null, quantity || null, dueDate || null, transactionStatus, paymentDate]);

    // Update stock if applicable
    if (productId && quantity) {
      let stockChange = 0;
      if (type === 'income' && category === 'Venta de Producto') {
        stockChange = -quantity;
      } else if (type === 'expense' && category === 'Compra de Inventario') {
        stockChange = quantity;
      }
      if (stockChange !== 0) {
        await updateProductStock(productId, stockChange, connection);
      }
    }

    await connection.commit();
    res.status(201).json({ id, type, date, description, amount, category, productId, quantity, dueDate, status: transactionStatus, paymentDate });
  } catch (error) {
    await connection.rollback();
    if (error.message.includes('Product not found') || error.message.includes('Insufficient stock')) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
  } finally {
    connection.release();
  }
};

// GET a single transaction by ID
exports.getTransactionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT t.*, p.name as productName FROM transactions t LEFT JOIN products p ON t.productId = p.id WHERE t.id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a transaction by ID (Simplified - stock changes not handled here, assumes major changes create new transaction)
exports.updateTransaction = async (req, res, next) => {
  const { id } = req.params;
  const { type, date, description, amount, category, productId, quantity, dueDate, status, paymentDate } = req.body;

  // Basic validation
  if (!type || !date || !description || !amount || !category) {
    return res.status(400).json({ message: 'Missing required fields for update' });
  }
  // Note: Complex updates (e.g. changing product or quantity) might require re-evaluating stock.
  // This example assumes that such changes are handled by deleting and creating a new transaction,
  // or that stock is managed primarily at creation or through dedicated stock adjustment endpoints.

  try {
    const query = 'UPDATE transactions SET type = ?, date = ?, description = ?, amount = ?, category = ?, productId = ?, quantity = ?, dueDate = ?, status = ?, paymentDate = ? WHERE id = ?';
    const [result] = await pool.query(query, [type, date, description, amount, category, productId || null, quantity || null, dueDate || null, status || null, paymentDate || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found or no changes made' });
    }
    res.json({ message: 'Transaction updated successfully', id });
  } catch (error) {
    next(error);
  }
};

// PATCH mark a transaction as paid
exports.markTransactionAsPaid = async (req, res, next) => {
  const { id } = req.params;
  const { paymentDate } = req.body;

  if (!paymentDate) {
    return res.status(400).json({ message: 'Payment date is required' });
  }

  try {
    const query = 'UPDATE transactions SET status = "paid", paymentDate = ? WHERE id = ? AND status != "paid"';
    const [result] = await pool.query(query, [paymentDate, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found, already paid, or no change needed' });
    }
    res.json({ message: 'Transaction marked as paid', id, paymentDate });
  } catch (error) {
    next(error);
  }
};

// DELETE a transaction by ID
exports.deleteTransaction = async (req, res, next) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // First, get the transaction to see if stock adjustment is needed
    const [transactionRows] = await connection.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (transactionRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const tx = transactionRows[0];

    // Delete the transaction
    const [result] = await connection.query('DELETE FROM transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) { // Should not happen if previous check passed
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Transaction not found during delete.' });
    }

    // If the deleted transaction affected stock, revert the stock change
    if (tx.productId && tx.quantity) {
      let stockChangeToRevert = 0;
      if (tx.type === 'income' && tx.category === 'Venta de Producto') {
        stockChangeToRevert = tx.quantity; // Add back to stock
      } else if (tx.type === 'expense' && tx.category === 'Compra de Inventario') {
        stockChangeToRevert = -tx.quantity; // Remove from stock
      }
      if (stockChangeToRevert !== 0) {
        await updateProductStock(tx.productId, stockChangeToRevert, connection);
      }
    }
    
    await connection.commit();
    res.status(204).send(); // No content
  } catch (error) {
    await connection.rollback();
    if (error.message.includes('Product not found') || error.message.includes('Insufficient stock')) {
        // This error during stock reversal is problematic, means data might be inconsistent.
        // For simplicity, returning error. A more robust system might log this for manual review.
        return res.status(500).json({ message: `Transaction deleted, but stock reversal failed: ${error.message}` });
    }
    next(error);
  } finally {
    connection.release();
  }
};
