
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all Location
exports.getAllLocation = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM location ORDER BY idlocation DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new location
exports.createLocation = async (req, res, next) => {
  const { location, description } = req.body;
  const idlocation = uuidv4(); // Generate new ID

  if ( !location ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO location (idlocation, location, description) VALUES (?, ?, ?)';
    await pool.query(query, [idlocation, location, description || null]);
    res.status(201).json({ idlocation, location, description });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDLocation already exists.' });
    }
    next(error);
  }
};

// GET a single location by ID
exports.getLocationById = async (req, res, next) => {
  const { idlocation } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM location WHERE idlocation = ?', [idlocation]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// PUT update a location by ID
exports.updateLocation = async (req, res, next) => {
  const { idlocation } = req.params;
  const { location } = req.body;
  const { description } = req.body;
 //console.log(req.body)
  if ( !location ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE location SET location = ?, description = ? WHERE idlocation = ?';
    const [result] = await pool.query(query, [location, description || null, idlocation]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found or no changes made' });
    }
    res.json({ idlocation, location, description });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IdLocation already exists for another Location.' });
    }
    next(error);
  }
};


// DELETE a location by ID
exports.deleteLocation = async (req, res, next) => {
  const { idlocation } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM location WHERE idlocation = ?', [idlocation]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this product
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Location. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
