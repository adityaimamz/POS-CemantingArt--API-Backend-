const express = require('express')
const router = express.Router()
const { getAllRekap, getRekap } = require('../controllers/rekapController')
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getAllRekap)
router.get('/:id', authMiddleware, getRekap)

module.exports = router;