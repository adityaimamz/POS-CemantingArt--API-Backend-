const express = require('express');
const router = express.Router();
const { getAllHargaJual, getHargaJual, storeHargaJual, updateHargaJual, deleteHargaJual } = require('../controllers/hargajualController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getAllHargaJual);
router.get('/:produk_id', authMiddleware, getHargaJual);
router.post('/', authMiddleware, storeHargaJual);
router.put('/:id', authMiddleware, updateHargaJual);
router.delete('/:id', authMiddleware, deleteHargaJual);

module.exports = router;