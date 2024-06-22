const express = require('express');
const router = express.Router();
const { storeTransaksi, getPaidTransaksi, getPOTransaksi, getAllTransaksi, getTransaksi, updateTransaksi, deleteTransaksi } = require('../controllers/TransaksiController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', getAllTransaksi);
router.get('/paid', authMiddleware, getPaidTransaksi);
router.get('/po', authMiddleware, getPOTransaksi);
router.get('/:id', authMiddleware, getTransaksi);
router.post('/', authMiddleware, storeTransaksi);
router.put('/:id', authMiddleware, updateTransaksi);
router.delete('/:id', authMiddleware, deleteTransaksi);

module.exports = router