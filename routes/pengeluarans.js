const express = require('express');
const router = express.Router();
const { getAllPengeluaran, getPengeluaran, storePengeluaran, updatePengeluaran, deletePengeluaran } = require('../controllers/pengeluaranController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getAllPengeluaran);
router.get('/:id', authMiddleware, getPengeluaran);
router.post('/', authMiddleware, storePengeluaran);
router.put('/:id', authMiddleware, updatePengeluaran);
router.delete('/:id', authMiddleware, deletePengeluaran);

module.exports = router;