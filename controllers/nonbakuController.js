const { Pengeluaran_Nonbaku, Rekap } = require('../models');
const { Op } = require("sequelize");

exports.getAllPengeluaran_Nonbaku = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        const whereCondition = {}; // Kondisi awal untuk query pencarian

        if (search) {
            // Jika ada query pencarian, tambahkan kondisi pencarian
            whereCondition[Op.or] = [
                { nama: { [Op.like]: `%${search}%` } }
            ];
        }

        // Menghitung jumlah total item setelah pencarian
        const totalCount = await Pengeluaran_Nonbaku.count({ where: whereCondition });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 9;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await Pengeluaran_Nonbaku.findAndCountAll({
            limit: limitData,
            offset: offsetData,
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
exports.getPengeluaran_Nonbaku = async (req, res) => {
    try {
        const pengeluaran_Nonbaku = await Pengeluaran_Nonbaku.findOne({
            where: {
                id: req.params.id,
            },
        });
        if (!pengeluaran_Nonbaku) {
            return res.status(404).json({
                status: 'error',
                message: 'Pengeluaran_Nonbaku tidak ditemukan',
            });
        }
        return res.status(200).json({
            data: pengeluaran_Nonbaku,
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
}
exports.storePengeluaran_Nonbaku = async (req, res) => {
    try {
        const { nama, qty, jumlah_pengeluaran,tanggal } = req.body;
        const pengeluaran_Nonbaku = await Pengeluaran_Nonbaku.create({
            nama,
            qty,
            jumlah_pengeluaran,
            tanggal
        });

        const rekap = await Rekap.create({
            transaksi_id: null,
            pengeluaran_id: pengeluaran_Nonbaku.id,
            tipe: 'pengeluaran',
            nominal: jumlah_pengeluaran,
            tanggal: tanggal
        });

        return res.status(201).json({
            data: pengeluaran_Nonbaku,
            rekap: rekap,
        });

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
}
exports.updatePengeluaran_Nonbaku = async (req, res) => {
    try {
        const id = req.params.id
        const { nama, qty, jumlah_pengeluaran,tanggal } = req.body
        const pengeluaran_Nonbaku = await Pengeluaran_Nonbaku.update({
            nama,
            qty,
            jumlah_pengeluaran,
            tanggal
        }, {
            where: {
                id: id
            }
        })

        // Temukan data pengeluaran yang baru saja diperbarui
        const updatedPengeluaran_Nonbaku = await Pengeluaran_Nonbaku.findByPk(id);
        if (!updatedPengeluaran_Nonbaku) {
            throw new Error('Pengeluaran tidak ditemukan');
        }

        // Update juga data di tabel Rekap
        await Rekap.update({
            nominal: jumlah_pengeluaran,
        }, {
            where: {
                pengeluaran_id: updatedPengeluaran_Nonbaku.id,
                tipe: 'pengeluaran'
            }
        });

        return res.status(200).json({
            data: updatedPengeluaran_Nonbaku
        })
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        })
    }
}
exports.deletePengeluaran_Nonbaku = async (req, res) => {
    try {
        const id = req.params.id;

        // Cari data pengeluaran berdasarkan ID
        const pengeluaran = await Pengeluaran_Nonbaku.findByPk(id);
        if (!pengeluaran) {
            res.status(404);
            throw new Error('Pengeluaran tidak ditemukan');
        }

        // Hapus entri terkait dalam rekap
        await Rekap.destroy({
            where: {
                pengeluaran_id: id,
                tipe: 'pengeluaran'
            }
        });

        // Hapus data pengeluaran setelah entri terkait dalam rekap dihapus
        await Pengeluaran_Nonbaku.destroy({
            where: {
                id: id
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Pengeluaran berhasil dihapus beserta entri terkait dalam rekap'
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
