const { HargaJual, Produk } = require('../models');
const { Op } = require("sequelize");

exports.getAllHargaJual = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        const whereCondition = {}; 

        if (search) {
            whereCondition[Op.or] = [
                { '$Produk.nama$': { [Op.like]: `%${search}%` } } 
            ];
        }
        const totalCount = await HargaJual.count({
            include: [{ model: Produk, where: whereCondition }], 
        });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 9;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await HargaJual.findAndCountAll({
            limit: limitData,
            offset: offsetData,
            include: [
                {
                    model: Produk,
                    attributes: ['nama'],
                    where: whereCondition 
                }
            ],
        });

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

exports.getHargaJual = async (req, res) => {
    try {
        const produk_id = req.params.produk_id; // Mengambil produk_id dari parameter URL

        const hargajual = await HargaJual.findAll({
            where: {
                produk_id: produk_id // Menggunakan produk_id untuk mencari harga jual yang sesuai
            },
            include: [
                {
                    model: Produk,
                    attributes: ['nama']
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        // Periksa apakah array hargajual kosong
        if (hargajual.length === 0) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Data hargajual tidak ditemukan',
            });
        }

        return res.status(200).json({
            status: 'success',
            data: hargajual
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.storeHargaJual = async (req, res) => {
    try {
        const { produk_id, harga_jual, tanggal } = req.body;
        if (!produk_id || !harga_jual) {
            return res.status(400).json({
                status: 'error',
                message: 'Produk id dan harga jual harus diisi'
            })
        }

        const produk = await Produk.findByPk(produk_id);
        if (!produk) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Produk tidak ditemukan'
            })
        }
        const hargajual = await HargaJual.create({
            produk_id,
            harga_jual,
            tanggal
        });
        return res.status(201).json({
            data: hargajual
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}
exports.updateHargaJual = async (req, res) => {
    try {
        const { id } = req.params;
        const { produk_id, harga_jual, tanggal } = req.body;
        const hargajual = await HargaJual.findByPk(id);
        if (!hargajual) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Harga jual tidak ditemukan'
            });
        }

        // Jika produk_id disertakan dalam permintaan, periksa apakah produk dengan id tersebut ada
        if (produk_id) {
            const produk = await Produk.findByPk(produk_id);
            if (!produk) {
                return res.status(404).json({
                    status: 'Not Found',
                    message: 'Produk tidak ditemukan'
                });
            }
        }

        // Perbarui harga jual
        await HargaJual.update({
            produk_id: produk_id || hargajual.produk_id,
            harga_jual,
            tanggal
        }, {
            where: {
                id
            }
        });

        // Ambil data harga jual yang sudah diperbarui
        const updatedHargaJual = await HargaJual.findByPk(id);
        return res.status(200).json({
            data: updatedHargaJual
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}
exports.deleteHargaJual = async (req, res) => {
    try {
        const id = req.params.id;
        const hargajual = await HargaJual.findByPk(id);
        if (!hargajual) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Harga jual tidak ditemukan'
            })
        }
        await HargaJual.destroy({
            where: {
                id
            }
        });
        return res.status(200).json({
            status: 'success',
            message: 'Harga jual berhasil dihapus!'
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}