const { Customer, Transaksi } = require("../models");
const { Op } = require("sequelize");

exports.getAllCustomer = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        const whereCondition = {}; // Kondisi awal untuk query pencarian

        if (search) {
            // Jika ada query pencarian, tambahkan kondisi pencarian
            whereCondition[Op.or] = [
                { nama_customer: { [Op.like]: `%${search}%` } },
                { no_telepon: { [Op.like]: `%${search}%` } }
            ];
        }

        // Menghitung jumlah total item setelah pencarian
        const totalCount = await Customer.count({ where: whereCondition });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 10;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await Customer.findAndCountAll({
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
exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                id: req.params.id,
            },
        });
        if (!customer) {
            return res.status(404).json({
                status: "error",
                message: "Customer tidak ditemukan",
            });
        }
        return res.status(200).json({
            data: customer,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
}

exports.storeCustomer = async (req, res) => {
    try {
        const { nama_customer, no_telepon, tanggal_lahir } = req.body;

        if (!nama_customer) {
            return res.status(400).json({
                status: "error",
                message: "Nama Customer Harus Diisi",
            })
        }

        const customer = await Customer.create({
            nama_customer,
            no_telepon,
            tanggal_lahir
        })
        return res.status(201).json({
            data: customer,
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
}

exports.updateCustomer = async (req, res) => {
    try {
        const id = req.params.id
        const { nama_customer, no_telepon, tanggal_lahir } = req.body
        const customer = await Customer.update({
            nama_customer,
            no_telepon,
            tanggal_lahir
        }, {
            where: {
                id: id
            }
        })

        const updateCustomer = await Customer.findByPk(id)
        if (!updateCustomer) {
            throw new Error("Customer tidak ditemukan")
        }
        return res.status(201).json({
            data: updateCustomer,
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
}

exports.deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;

        // Cek apakah customer memiliki transaksi terkait
        const transaksiCount = await Transaksi.count({
            where: {
                customer_id: id
            }
        });

        if (transaksiCount > 0) {
            return res.status(400).json({
                status: "error",
                message: "Customer memiliki transaksi terkait dan tidak dapat dihapus"
            });
        }

        // Jika tidak ada transaksi terkait, lanjutkan dengan penghapusan customer
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                status: "error",
                message: "Customer tidak ditemukan"
            });
        }

        await Customer.destroy({
            where: {
                id: id
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Customer berhasil dihapus"
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};
