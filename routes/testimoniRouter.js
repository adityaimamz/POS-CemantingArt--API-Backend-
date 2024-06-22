const express = require('express');
const router = express.Router();
const { storeTestimoni, updateTestimoni, deleteTestimoni, getAllTestimoni, getTestimoni } = require('../controllers/testimoniController');
const {authMiddleware} = require('../middleware/UserMiddleware');


router.get('/:transaksi_id', authMiddleware, getTestimoni);
router.post('/', authMiddleware, storeTestimoni);
router.put('/:id', authMiddleware, updateTestimoni);
router.delete('/:id', authMiddleware, deleteTestimoni);
router.get('/', authMiddleware, getAllTestimoni);


module.exports = router