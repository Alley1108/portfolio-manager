const router = require('express').Router();
const auth = require('../middleware/auth');
const { getClients, addClient, deleteClient } = require('../controllers/clientController');
router.get('/', auth, getClients);
router.post('/', auth, addClient);
router.delete('/:id', auth, deleteClient);
module.exports = router;
