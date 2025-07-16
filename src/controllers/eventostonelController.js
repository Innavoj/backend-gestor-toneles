
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all eventos
exports.getAllEventostonel = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM eventostoneles ORDER BY idtonel DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// POST a new eventos
exports.createEventostonel = async (req, res, next) => {
  const { idtonel, tipoevento, fechaevento, descripcion } = req.body;
  const idevento = uuidv4(); // Generate new ID

  if (!tipoevento || !fechaevento || !descripcion) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'INSERT INTO eventostoneles (idevento, idtonel, tipoevento, fechaevento, descripcion) VALUES (?, ?, ?, ?, ?)';
    await pool.query(query, [idevento, idtonel, tipoevento, fechaevento, descripcion || null]);
    res.status(201).json({ idevento, idtonel, tipoevento, fechaevento, descripcion });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDevento  already exists.' });
    }
    next(error);
  }
};

// GET a single eventos by ID
exports.getEventostonelById = async (req, res, next) => {
  const { idtonel } = req.params;
  sql1='SELECT nserial, tipoevento, fechaevento, descripcion FROM toneles t '
  sql2='join eventostoneles e2 on t.idtonel = e2.idtonel where t.idtonel = ?'
 // sql3='order by e2.fechaevento'
  try {
   const [rows] = await pool.query(sql1 + '' + sql2, [idtonel]);
   console.log(rows);
  //  const [rows] = await pool.query('SELECT * FROM eventostoneles WHERE idtonel = ?', [idtonel]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evento not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// exports.getEventostonelById = async (req, res, next) => {
//   const { idevento } = req.params;
//   try {
//     const [rows] = await pool.query('SELECT * FROM eventostoneles WHERE idevento = ?', [idevento]);
//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Evento not found' });
//     }
//     res.json(rows[0]);
//   } catch (error) {
//     next(error);
//   }
// };

// PUT update a evento by ID
exports.updateEventostonel = async (req, res, next) => {
  const { idevento } = req.params;
  const { idtonel, tipoevento, fechaevento, descripcion } = req.body;

  if (!tipoevento || !fechaevento || !descripcion) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = 'UPDATE eventostoneles SET idtonel = ?, tipoevento = ?, fechaevento = ?, descripcion = ? WHERE idevento = ?';
    const [result] = await pool.query(query, [idtonel, tipoevento, fechaevento, descripcion || null, idevento]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento not found or no changes made' });
    }
    res.json({ idevento, idtonel, tipoevento, fechaevento, descripcion });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'IDEvento already exists for another Evento.' });
    }
    next(error);
  }
};

// DELETE a evento by ID
exports.deleteEventostonel = async (req, res, next) => {
  const { idevento } = req.params;
  try {
    // Check for related transactions if strict foreign key constraints are not set or if you want a custom message
    // For now, assuming ON DELETE SET NULL handles it or we accept deletion.
    const [result] = await pool.query('DELETE FROM eventostoneles WHERE idevento = ?', [idevento]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    // Handle foreign key constraint errors if a transaction references this product
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Cannot delete Evento. It is referenced by existing transactions. Consider archiving or unlinking first.' });
    }
    next(error);
  }
};
