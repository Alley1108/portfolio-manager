const router = require('express').Router();
const auth = require('../middleware/auth');
const { getStockPrice } = require('../controllers/stockController');
router.get('/:symbol', auth, getStockPrice);
module.exports = router;
