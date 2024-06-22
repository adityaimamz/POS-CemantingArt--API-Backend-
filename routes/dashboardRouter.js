const express = require('express');
const router = express.Router();
const { countPaidTransaksi, countPOTransaksi, countTransaksi, countCustomer, countProduk, countGrossIncome, getStokQty, getIncomeChartData, getIncomeCountChartData } = require('../controllers/dashboardController');
const {authMiddleware} = require('../middleware/UserMiddleware');

router.get('/paidtransaksi', authMiddleware, countPaidTransaksi);
router.get('/potransaksi', authMiddleware, countPOTransaksi);
router.get('/transaksi', authMiddleware, countTransaksi);
router.get('/customer', authMiddleware, countCustomer);
router.get('/produk', authMiddleware, countProduk);
router.get('/grossincome', authMiddleware, countGrossIncome);
router.get('/stokqty', authMiddleware, getStokQty);
router.get('/incomechart', authMiddleware, getIncomeChartData);
router.get('/countincomechart', authMiddleware, getIncomeCountChartData);

module.exports = router;