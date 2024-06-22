const express = require('express');
const router = express.Router();
const { getAllStok, getStok, storeStok, updateStok, deleteStok } = require('../controllers/stokController');
const {authMiddleware} = require('../middleware/UserMiddleware')

router.get('/', authMiddleware, getAllStok);
router.get('/:id', authMiddleware, getStok);
router.post('/', authMiddleware, storeStok);
router.put('/:id', authMiddleware, updateStok);
router.delete('/:id', authMiddleware, deleteStok);

module.exports = router;