
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all dispenser
exports.getAllDispenser = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dispensadores ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new dispenser
exports.createDispenser = async (req, res, next) => {
  const { nserial, status, location, acquired, notas } = req.body;
  const iddispensador = uuidv4(); // Generate new ID

  if (!nserial || status === undefined || location === undefined || !acquired) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO dispensadores (iddispensador, nserial, status, location, acquired, notas) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(query, [iddispensador, nserial, status, location, acquired, notas || null]);
    res.status(201).json({ iddispensador, nserial, status, location, acquired, notas });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Numero Serie already exists.' });
    }
    next(error);
  }
};

// GET a single dispenser by ID
exports.getDispenserById = async (req, res, next) => {
  const { iddispensador } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM dispensadores WHERE iddispensador = ?', [iddispensador]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dispensador not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a dispenser by ID
exports.updateDispenser = async (req, res, next) => {
  const { iddispensador } = req.params;
  const { nserial, status, location, acquired, notas } = req.body;

  if (!nserial || status === undefined || location === undefined || !acquired) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE dispensadores SET nserial = ?, status = ?, location = ?, acquired = ?, notas = ? WHERE iddispensador = ?';
    const [result] = await pool.query(query, [nserial, status, location, acquired, notas || null, iddispensador]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Dispensador not found or no changes made' });
    }
    res.json({ iddispensador, nserial, status, location, acquired, notas });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'NSerial already exists for another Dispensador.' });
    }
    next(error);
  }
};

// DELETE a dispenser by ID
exports.deleteDispenser = async (req, res, next) => {
  const { iddispensador } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM dispensadores WHERE iddispensador = ?', [iddispensador]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Dispensador not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this dispenser
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Dispensador. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
