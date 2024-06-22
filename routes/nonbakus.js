const express = require('express');
const router = express.Router();
const { getAllPengeluaran_Nonbaku, getPengeluaran_Nonbaku, storePengeluaran_Nonbaku, updatePengeluaran_Nonbaku, deletePengeluaran_Nonbaku } = require('../controllers/nonbakuController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getAllPengeluaran_Nonbaku);
router.get('/:id', authMiddleware, getPengeluaran_Nonbaku);
router.post('/', authMiddleware, storePengeluaran_Nonbaku);
router.put('/:id', authMiddleware, updatePengeluaran_Nonbaku);
router.delete('/:id', authMiddleware, deletePengeluaran_Nonbaku);

module.exports = router;