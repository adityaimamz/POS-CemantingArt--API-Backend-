const express = require('express')
const router = express.Router()
const { getStokByMonth } = require('../controllers/stokController')
const {authMiddleware} = require('../middleware/UserMiddleware');


router.get('/', authMiddleware, getStokByMonth);

module.exports = router