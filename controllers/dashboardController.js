const { Transaksi, Customer, Produk, Rekap, Stok, sequelize } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const moment = require('moment'); // Impor library moment.js
const { QueryTypes } = require('sequelize');

exports.countPaidTransaksi = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const jumlahPaidTransaksi = await Transaksi.count({
            where: {
                status: 'Paid',
                createdAt: {
                    [Sequelize.Op.gte]: firstDayOfMonth,
                    [Sequelize.Op.lte]: lastDayOfMonth
                }
            }
        })

        return res.status(200).json({
            message: 'success',
            data: jumlahPaidTransaksi
        })
    } catch {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.countPOTransaksi = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const jumlahPaidTransaksi = await Transaksi.count({
            where: {
                status: 'PO',
                createdAt: {
                    [Sequelize.Op.gte]: firstDayOfMonth,
                    [Sequelize.Op.lte]: lastDayOfMonth
                }
            }
        })

        return res.status(200).json({
            message: 'success',
            data: jumlahPaidTransaksi
        })
    } catch {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.countTransaksi = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const jumlahPaidTransaksi = await Transaksi.count({
            where: {
                createdAt: {
                    [Sequelize.Op.gte]: firstDayOfMonth,
                    [Sequelize.Op.lte]: lastDayOfMonth
                }
            }
        })

        return res.status(200).json({
            message: 'success',
            data: jumlahPaidTransaksi
        })
    } catch {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.countCustomer = async (req, res) => {
    try {
        const countCustomer = await Customer.count();
        return res.status(200).json({
            message: 'success',
            data: countCustomer
        })
    } catch {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.countProduk = async (req, res) => {
    try {
        const countProduk = await Produk.count();
        return res.status(200).json({
            message: 'success',
            data: countProduk
        })
    } catch {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.countGrossIncome = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const countIncome = await Rekap.sum('nominal', {
            where: {
                tipe: 'pendapatan',
                createdAt: {
                    [Sequelize.Op.gte]: firstDayOfMonth,
                    [Sequelize.Op.lte]: lastDayOfMonth
                }
            }
        });

        return res.status(200).json({
            message: 'success',
            data: countIncome
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message,
        })
    }
}

exports.getStokQty = async (req, res) => {
    try {
        const query = `
        SELECT 
        s.produk_id AS id_produk,
        p.nama AS nama_produk,
        MAX(CASE WHEN (s.tipe_stok = 'stok_masuk') THEN s.harga_produksi END) AS harga_produksi,
        (SUM(CASE WHEN (s.tipe_stok = 'stok_masuk') THEN s.qty ELSE 0 END) - SUM(CASE WHEN (s.tipe_stok = 'stok_keluar') THEN s.qty ELSE 0 END)) AS sisa_stok 
    FROM 
        ecoprint.Stoks s 
        JOIN ecoprint.Produks p ON (s.produk_id = p.id) 
    GROUP BY 
         s.produk_id, p.nama
    ORDER BY 
         sisa_stok ASC
        `;

        const stoks = await sequelize.query(query, { type: QueryTypes.SELECT });

        return res.status(200).json({
            status: 'success',
            data: stoks
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.getIncomeChartData = async (req, res) => {
    try {
        // Query untuk menghitung jumlah pendapatan tiap bulan
        const result = await Rekap.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('tanggal')), 'bulan'],
                [sequelize.fn('YEAR', sequelize.col('tanggal')), 'tahun'],
                [sequelize.fn('SUM', sequelize.col('nominal')), 'total_pendapatan']
            ],
            where: {
                tipe: 'pendapatan'
            },
            group: [sequelize.fn('MONTH', sequelize.col('tanggal')), sequelize.fn('YEAR', sequelize.col('tanggal'))],
            raw: true
        });

        const dataChart = Array.from({ length: 12 }, () => 0); 
        result.forEach(row => {
            const bulan = row.bulan - 1; 
            dataChart[bulan] += parseInt(row.total_pendapatan, 10);
        });

        res.status(200).json({
            status: 'success',
            data: dataChart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getIncomeCountChartData = async (req, res) => {
    try {
        // Query untuk menghitung jumlah data Rekap tiap bulan
        const result = await Rekap.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('tanggal')), 'bulan'],
                [sequelize.fn('YEAR', sequelize.col('tanggal')), 'tahun'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_data']
            ],
            where: {
                tipe: 'pendapatan'
            },
            group: [sequelize.fn('MONTH', sequelize.col('tanggal')), sequelize.fn('YEAR', sequelize.col('tanggal'))],
            raw: true
        });

        // Format hasil query agar sesuai dengan format yang diinginkan oleh Chart.js
        const dataChart = Array.from({ length: 12 }, () => 0); // Inisialisasi array untuk menyimpan jumlah data tiap bulan
        result.forEach(row => {
            const bulan = row.bulan - 1; // Bulan dimulai dari 1, sedangkan index array dimulai dari 0
            dataChart[bulan] += row.total_data;
        });

        res.status(200).json({
            status: 'success',
            data: dataChart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};