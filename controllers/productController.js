const { Produk, HargaJual, sequelize, Stok } = require('../models');
const fs = require('fs');
const { Op } = require("sequelize");

exports.addProduk = async (req, res) => {
    try {
        const { nama } = req.body;
        const file = req.file;

        if (!file || !nama) { // Periksa jika file tidak ada
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Gambar dan nama produk harus diisi'
            });
        }

        const fileName = file.filename;
        const pathImage = `${req.protocol}://${req.get("host")}/public/uploads/${fileName}`;

        const newProduk = await Produk.create({
            nama,
            gambar: pathImage
        });

        return res.status(201).json({
            status: 'Created',
            data: newProduk
        });

    } catch (error) {
        if (req.file) {
            const filePath = req.file.path;
            fs.unlinkSync(filePath); // Menghapus file yang diunggah jika terjadi error
        }
        return res.status(400).json({
            status: "error",
            message: error.message, // Mengembalikan pesan error jika terjadi kesalahan
        });
    }
};

exports.readAllProduk = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        let whereCondition = {};

        if (search) {
            whereCondition = {
                nama: {
                    [Op.like]: `%${search}%`
                }
            };
        }

        const totalCount = await Produk.count({ where: whereCondition });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 10;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await Produk.findAndCountAll({
            limit: limitData,
            offset: offsetData,
            where: whereCondition,
            include: [{
                model: HargaJual,
                order: [['tanggal', 'DESC']],
                limit: 1,
                attributes: ['harga_jual']
            }]
        });

        const produkWithTotalQty = await Promise.all(rows.map(async (produk) => {
            const totalMasuk = await Stok.sum('qty', {
                where: { produk_id: produk.id, tipe_stok: 'stok_masuk' }
            });
            const totalKeluar = await Stok.sum('qty', {
                where: { produk_id: produk.id, tipe_stok: 'stok_keluar' }
            });
            const totalQty = totalMasuk - totalKeluar;

            return { ...produk.dataValues, total_qty: totalQty };
        }));

        const totalPages = Math.ceil(totalCount / limitData);

        return res.status(200).json({
            status: 'success',
            data: produkWithTotalQty,
            page: pageData,
            page_size: limitData,
            total_page: totalPages,
            total_items: totalCount
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.readProduk = async (req, res) => {
    try {
        const id = req.params.id;
        const produk = await Produk.findByPk(id, {
            include: [
                {
                    model: HargaJual,
                    where: { produk_id: id },
                    order: [['tanggal', 'DESC']],
                    attributes: ['harga_jual'],
                    limit: 1
                },
                {
                    model: Stok,
                    where: { produk_id: id },
                    attributes: []
                }
            ],
            attributes: ['id', 'nama', 'gambar']
        });

        if (!produk) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Produk tidak ditemukan'
            });
        }

        // Hitung total qty
        const totalMasuk = await Stok.sum('qty', {
            where: { produk_id: id, tipe_stok: 'stok_masuk' }
        });
        const totalKeluar = await Stok.sum('qty', {
            where: { produk_id: id, tipe_stok: 'stok_keluar' }
        });
        const totalQty = totalMasuk - totalKeluar;

        return res.status(200).json({
            data: {
                produk,
                total_qty: totalQty
            }
        });

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
};

exports.updateProduk = async (req, res) => {
    try {
        const id = req.params.id;
        let { nama } = req.body;

        const produkData = await Produk.findByPk(id);

        if (!produkData) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Produk tidak ditemukan'
            });
        }

        const file = req.file;
        if (file) {
            // Hapus file gambar lama jika ada
            const imageName = produkData.gambar.replace(
                `${req.protocol}://${req.get("host")}/public/uploads/`,
                ""
            );
            const pathFileImage = `./public/uploads/${imageName}`;
            
            if (fs.existsSync(pathFileImage)) {
                fs.unlinkSync(pathFileImage); // Hapus file gambar lama
            }

            // Simpan nama file gambar baru dan path gambar baru
            const fileName = file.filename;
            const pathImage = `${req.protocol}://${req.get(
                "host"
            )}/public/uploads/${fileName}`;

            produkData.gambar = pathImage; // Simpan path gambar baru
        }

        if (nama) {
            produkData.nama = nama;
        }

        await produkData.save(); // Tunggu hingga proses penyimpanan selesai

        return res.status(200).json({
            message: 'Produk berhasil diperbarui',
            data: produkData
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.deleteProduk = async (req, res) => {
    try {
        const id = req.params.id;
        const productData = await Produk.findByPk(id);

        if (productData) {
            const imageName = productData.gambar.replace(
                `${req.protocol}://${req.get("host")}/public/uploads/`,
                ""
            );
            const pathFileImage = `./public/uploads/${imageName}`;

            // Pengecekan apakah file ada sebelum mencoba untuk menghapusnya
            if (fs.existsSync(pathFileImage)) {
                fs.unlinkSync(pathFileImage); // Hapus file gambar
            }

            await productData.destroy(); // Tunggu hingga produk dihapus

            return res.status(200).json({
                status: 'success',
                message: "Produk berhasil dihapus"
            });
        } else {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Produk tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};