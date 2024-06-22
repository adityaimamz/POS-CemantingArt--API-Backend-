const express = require('express');
const router = express.Router();
const { readProduk, readAllProduk, addProduk, updateProduk, deleteProduk } = require('../controllers/productController');
const { uploadOption } = require('../utils/fileUpload')
const {authMiddleware} = require('../middleware/UserMiddleware');


router.get('/', authMiddleware, readAllProduk);

router.get('/:id', authMiddleware, readProduk);

router.post('/', authMiddleware, uploadOption.single('gambar'), addProduk);

router.put('/:id', authMiddleware, uploadOption.single('gambar'), updateProduk);

router.delete('/:id', authMiddleware, deleteProduk);

module.exports = router;