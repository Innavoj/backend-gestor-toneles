const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all lotes
exports.getAllLotes = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lotesproduccion ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new lotes
exports.createLotes = async (req, res, next) => {
  const { idtonel, lotename, style, volumen, status, entprod, salprod } = req.body;
  const idlote = uuidv4(); // Generate new ID

  if (!idtonel || !lotename || !style || !volumen || !status || !entprod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO lotesproduccion (idlote, idtonel, lotename, style, volumen, status, entprod, salprod) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.query(query, [idlote, idtonel, lotename, style, volumen, status, entprod, salprod || null]);
    res.status(201).json({ idlote, idtonel, lotename, style, volumen, status, entprod, salprod });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Numero lote already exists.' });
    }
    next(error);
  }
};

// GET a single lotes by ID
exports.getLotesById = async (req, res, next) => {
  const { idlote } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM lotesproduccion WHERE idlote = ?', [idlote]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lote not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a product by ID
exports.updateLotes = async (req, res, next) => {
  const { idlote } = req.params;
  const { idtonel, lotename, style, volumen, status, entprod, salprod } = req.body;

  if (!idtonel || !lotename || !style || !volumen || !status || !entprod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE lotesproduccion SET idtonel = ?, lotename = ?, style = ?, volumen = ?, status = ?, entprod = ?, salprod = ? WHERE idlote = ?';
    const [result] = await pool.query(query, [idtonel, lotename, style, volumen, status, entprod, salprod || null, idlote]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lote not found or no changes made' });
    }
    res.json({ idlote, idtonel, lotename, style, volumen, status, entprod, salprod });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDlote already exists for another Lote.' });
    }
    next(error);
  }
};

// DELETE a product by ID
exports.deleteLotes = async (req, res, next) => {
  const { idlote } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM lotesproduccion WHERE idlote = ?', [idlote]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lote not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this product
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Lote. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
