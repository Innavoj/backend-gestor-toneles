const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all mtto
exports.getAllmttodispenser = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mttodispensadores ORDER BY iddispensador DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new mtto
exports.createmttodispenser = async (req, res, next) => {
  const { iddispensador, tipomtto, fechaini, fechafin, status } = req.body;
  const idmtto = uuidv4(); // Generate new ID

  if (!tipomtto || !fechaini || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO mttodispensadores (idmtto, iddispensador, tipomtto, fechaini, fechafin, status) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(query, [idmtto, iddispensador, tipomtto, fechaini, fechafin, status || null]);
    res.status(201).json({ idmtto, iddispensador, tipomtto, fechaini, fechafin, status });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDmtto Dispenser already exists.' });
    }
    next(error);
  }
};

// GET a single mtto by ID
exports.getmttodispenserById = async (req, res, next) => {
  const { idmtto } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM mttodispensadores WHERE idmtto = ?', [idmtto]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mtto Dispenser not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a mtto by ID
exports.updatemttodispenser = async (req, res, next) => {
  const { idmtto } = req.params;
  const { iddispensador, tipomtto, fechaini, fechafin, status } = req.body;

  if (!tipomtto || !fechaini || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE mttodispensadores SET iddispensador = ?, tipomtto = ?, fechaini = ?, fechafin = ?, status = ? WHERE idmtto = ?';
    const [result] = await pool.query(query, [iddispensador, tipomtto, fechaini, fechafin, status || null, idmtto]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mtto Dispenser not found or no changes made' });
    }
    res.json({ idmtto, iddispensador, tipomtto, fechaini, fechafin, status });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDMtto Dispenser already exists for another Mtto.' });
    }
    next(error);
  }
};

// DELETE a Mtto by ID
exports.deletemttodispenser = async (req, res, next) => {
  const { idmtto } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM mttodispensadores WHERE idmtto = ?', [idmtto]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mtto Dispenser not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this product
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Mtto Dispenser. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
