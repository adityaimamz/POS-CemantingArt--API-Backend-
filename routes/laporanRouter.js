const express = require('express');
const router = express.Router();
const {getLaporanByMonth} = require('../controllers/rekapController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/', authMiddleware, getLaporanByMonth)

module.exports = router;
