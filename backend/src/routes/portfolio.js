const router = require('express').Router();
const auth = require('../middleware/auth');
const { getPortfolio, addHolding, sellHolding, deleteHolding } = require('../controllers/portfolioController');
router.get('/:clientId', auth, getPortfolio);
router.post('/', auth, addHolding);
router.put('/:id/sell', auth, sellHolding);
router.delete('/:id', auth, deleteHolding);
module.exports = router;
