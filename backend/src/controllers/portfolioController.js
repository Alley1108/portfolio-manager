const pool = require('../models/db');
const axios = require('axios');

const getLivePrice = async (symbol) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return response.data.chart.result[0].meta.regularMarketPrice;
  } catch {
    return null;
  }
};

exports.getPortfolio = async (req, res) => {
  const { clientId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM holdings WHERE client_id = $1 ORDER BY buy_date DESC',
      [clientId]
    );
    const holdings = result.rows;

    const enriched = await Promise.all(holdings.map(async (h) => {
      const currentPrice = h.sell_price ? h.sell_price : await getLivePrice(h.symbol);
      const investedAmount = h.buy_price * h.quantity;
      const currentAmount = currentPrice ? currentPrice * h.quantity : investedAmount;
      const pnl = currentAmount - investedAmount;
      return { ...h, currentPrice, investedAmount, currentAmount, pnl };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addHolding = async (req, res) => {
  const { client_id, symbol, company_name, quantity, buy_price, buy_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO holdings (client_id, symbol, company_name, quantity, buy_price, buy_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [client_id, symbol.toUpperCase(), company_name, quantity, buy_price, buy_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sellHolding = async (req, res) => {
  const { sell_price, sell_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE holdings SET sell_price=$1, sell_date=$2 WHERE id=$3 RETURNING *',
      [sell_price, sell_date, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHolding = async (req, res) => {
  try {
    await pool.query('DELETE FROM holdings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Holding deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
