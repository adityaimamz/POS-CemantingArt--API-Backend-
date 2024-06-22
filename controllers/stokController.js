const { Stok, Produk, sequelize, Pengeluaran } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require("sequelize");

exports.getAllStok = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        const whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { tipe_stok: { [Op.like]: `%${search}%` } }
            ];
        }

        // Menghitung jumlah total item setelah pencarian
        const totalCount = await Stok.count({ where: whereCondition });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 9;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await Stok.findAndCountAll({
            limit: limitData,
            offset: offsetData,
            include: [
                {
                    model: Produk,
                    attributes: ['nama', 'gambar'],
                }
            ],
            where: whereCondition
        });

        // Menghitung total halaman berdasarkan total item dan batas halaman
        const totalPages = Math.ceil(totalCount / limitData);

        return res.status(200).json({
            data: rows,
            page: pageData,
            page_size: limitData,
            total_page: totalPages,
            total_items: totalCount
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
}

exports.getStok = async (req, res) => {
    try {
        const id = req.params.id
        const stok = await Stok.findByPk(id, {
            include: [
                {
                    model: Produk,
                    attributes: ['nama', 'gambar'],
                },
            ]
        })
        if (!stok) {
            res.status(404);
            throw new Error('Stok tidak ditemukan');
        }
        return res.status(200).json({
            data: stok,
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
}

exports.storeStok = async (req, res) => {
    try {
        const { produk_id, transaksi_id, qty, tanggal } = req.body;

        const totalPengeluaran = await Pengeluaran.sum('harga', {
            where: { produk_id }
        });

        if ( !produk_id || !qty ) {
            return res.status(400).json({
                status: 'error',
                message: 'Produk_id dan qty harus diisi',
            })
        }

        const stok = await Stok.create({
            produk_id,
            transaksi_id,
            harga_produksi: totalPengeluaran, 
            qty,
            tipe_stok: "stok_masuk",
            tanggal
        });

        return res.status(201).json({
            data: stok,
        });

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.updateStok = async (req, res) => {
    try {
        const id = req.params.id;
        const { produk_id, transaksi_id, qty, tipe_stok, tanggal } = req.body;

        const totalPengeluaran = await Pengeluaran.sum('harga', {
            where: { produk_id }
        });

        const updatedStok = await Stok.findByPk(id);
        if (!updatedStok) {
           return res.status(404).json({
               status: 'Not Found',
               message: 'Stok tidak ditemukan',
           })
        }

        const updatedStokData = {
            produk_id,
            transaksi_id,
            harga_produksi: totalPengeluaran,
            qty,
            tipe_stok,
            tanggal
        };

        await updatedStok.update(updatedStokData);

        return res.status(200).json({
            data: updatedStok
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.deleteStok = async (req, res) => {
    try {
        const id = req.params.id;

        // Temukan stok berdasarkan id
        const stok = await Stok.findByPk(id);

        // Jika stok tidak ditemukan, kembalikan respons 404
        if (!stok) {
            return res.status(404).json({
                status: 'error',
                message: 'Stok tidak ditemukan'
            });
        }

        // Jika tipe stok bukan 'stok_masuk', kembalikan respons bahwa stok keluar tidak bisa dihapus
        if (stok.tipe_stok !== 'stok_masuk') {
            return res.status(400).json({
                status: 'error',
                message: 'Stok keluar tidak bisa dihapus'
            });
        }

        // Hapus stok jika tipe stok adalah 'stok_masuk'
        await stok.destroy();

        // Jika stok berhasil dihapus, kembalikan respons sukses
        return res.status(200).json({
            status: 'success',
            message: 'Stok berhasil dihapus'
        });
    } catch (error) {
        // Tangani kesalahan jika terjadi
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.getStokByMonth = async (req, res) => {
    try {
        const { month } = req.query;

        // Validasi input bulan
        if (!month || !/^(0?[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({
                status: 'error',
                message: 'Bulan harus dalam format angka antara 1 dan 12'
            });
        }

        const query = `
            SELECT 
                MONTH(CURRENT_DATE) AS Bulan,
                p.nama AS nama_produk,
                SUM(CASE WHEN (s.tipe_stok = 'stok_masuk') THEN s.qty ELSE 0 END) AS total_stok_masuk,
                SUM(CASE WHEN (s.tipe_stok = 'stok_keluar') THEN s.qty ELSE 0 END) AS total_stok_keluar,
                (SUM(CASE WHEN (s.tipe_stok = 'stok_masuk') THEN s.qty ELSE 0 END) - SUM(CASE WHEN (s.tipe_stok = 'stok_keluar') 
                THEN s.qty ELSE 0 END)) AS sisa_stok 
            FROM 
                ecoprint.Stoks s 
                JOIN ecoprint.Produks p ON (s.produk_id = p.id) 
            WHERE 
                MONTH(s.createdAt) = ?
            GROUP BY 
                 p.nama
        `;

        const stoks = await sequelize.query(query, {
            replacements: [month],
            type: QueryTypes.SELECT
        });

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
