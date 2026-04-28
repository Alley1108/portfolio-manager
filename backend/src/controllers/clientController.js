const pool = require('../models/db');

exports.getClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE manager_id = $1 ORDER BY created_at DESC',
      [req.manager.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addClient = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (manager_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.manager.id, name, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1 AND manager_id = $2', [req.params.id, req.manager.id]);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
