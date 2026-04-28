const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO managers (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );
    res.status(201).json({ message: 'Manager registered', manager: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM managers WHERE email = $1', [email]);
    const manager = result.rows[0];
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    const valid = await bcrypt.compare(password, manager.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: manager.id, email: manager.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, manager: { id: manager.id, name: manager.name, email: manager.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
