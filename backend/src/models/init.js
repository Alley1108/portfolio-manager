const pool = require('./db');

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS managers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER REFERENCES managers(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS holdings (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        symbol VARCHAR(20) NOT NULL,
        company_name VARCHAR(100),
        quantity INTEGER NOT NULL,
        buy_price NUMERIC(10,2) NOT NULL,
        buy_date DATE NOT NULL,
        sell_price NUMERIC(10,2),
        sell_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables ready');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
};

module.exports = initDB;
