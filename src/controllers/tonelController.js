
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all products
exports.getAllToneles = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM toneles ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new product
exports.createTonel = async (req, res, next) => {
  const { nserial, capacity, status, location, acquired, vidautil, notas } = req.body;
  const idtonel = uuidv4(); // Generate new ID

  if (!nserial || !capacity || status === undefined || location === undefined || acquired === undefined || vidautil === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO toneles (idtonel, nserial, capacity, status, location, acquired, vidautil, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.query(query, [idtonel, nserial, capacity, status, location, acquired, vidautil, notas || null]);
    res.status(201).json({ idtonel, nserial, capacity, status, location, acquired, vidautil, notas });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Numero Serie already exists.' });
    }
    next(error);
  }
};

// GET a single product by ID
exports.getTonelById = async (req, res, next) => {
  const { idtonel } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM toneles WHERE idtonel = ?', [idtonel]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tonel not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a product by ID
exports.updateTonel = async (req, res, next) => {
  const { idtonel } = req.params;
  const { nserial, capacity, status, location, acquired, vidautil, notas } = req.body;
 //console.log(req.body)
  if ( !nserial || !capacity || !status || !location || !acquired || !vidautil ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE toneles SET nserial = ?, capacity = ?, status = ?, location = ?, acquired = ?, vidautil = ?, notas = ? WHERE idtonel = ?';
    const [result] = await pool.query(query, [nserial, capacity, status, location, acquired, vidautil, notas || null, idtonel]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tonel not found or no changes made' });
    }
    res.json({ idtonel, nserial, capacity, status, location, acquired, vidautil, notas });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'NSerial already exists for another Tonel.' });
    }
    next(error);
  }
};



// PUT update a Tonel Status by ID
exports.updateTonelStatusLocation = async (req, res, next) => {
  const { idtonel } = req.params;
  const { status, location, notas } = req.body;
 console.log(req.body)
  if ( !status || !location  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE toneles SET status = ?, location = ?, notas = ? WHERE idtonel = ?';
    const [result] = await pool.query(query, [status, location, notas || null, idtonel]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tonel Status not found or no changes made' });
    }
    res.json({ idtonel, status, location, notas });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'NSerial already exists for another Tonel.' });
    }
    next(error);
  }
};

// DELETE a product by ID
exports.deleteTonel = async (req, res, next) => {
  const { idtonel } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM toneles WHERE idtonel = ?', [idtonel]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tonel not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this product
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Tonel. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
