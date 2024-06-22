const express = require('express');
const router = express.Router();
const { getAllCustomer, getCustomer, storeCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getAllCustomer);
router.get('/:id', authMiddleware, getCustomer);
router.post('/', authMiddleware, storeCustomer);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

module.exports = router;