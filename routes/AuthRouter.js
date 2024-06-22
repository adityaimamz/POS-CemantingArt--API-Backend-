const express = require('express')
const router = express.Router()
const { Login } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/UserMiddleware')

router.post('/login', Login)

module.exports = router