const axios = require('axios');

exports.getStockPrice = async (req, res) => {
  const { symbol } = req.params;
  try {
    const nseSymbol = symbol.toUpperCase() + '.NS';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const price = response.data.chart.result[0].meta.regularMarketPrice;
    const companyName = response.data.chart.result[0].meta.longName || symbol;
    res.json({ symbol, companyName, price });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch stock price', error: err.message });
  }
};
