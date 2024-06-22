const { Testimoni, Customer, Transaksi } = require('../models');

exports.storeTestimoni = async (req, res) => {
    try {
        const { customer_id, transaksi_id, testimoni, tanggal } = req.body;

        if (!customer_id || !transaksi_id || !testimoni) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'customer_id, transaksi_id dan testimoni harus diisi',
            })
        }

        const customer = await Customer.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Customer tidak ditemukan',
            })
        }
        const transaksi = await Transaksi.findByPk(transaksi_id);
        if (!transaksi) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Transaksi tidak ditemukan',
            })
        }
        const data = await Testimoni.create({
            customer_id,
            transaksi_id,
            testimoni,
            tanggal
        });
        return res.status(201).json({
            status: 'success',
            message: 'Testimoni berhasil ditambahkan',
            data: {
                testimoni: data
            }
        })
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getAllTestimoni = async (req, res) => {
    try {
        const { limit, page } = req.query;

        const totalCount = await Testimoni.count();

        let dataTestimoni;

        if (limit || page) {
            const pageData = page * 1 || 1;
            const limitData = limit * 1 || 9;
            const offsetData = (pageData - 1) * limitData;

            const { rows } = await Testimoni.findAndCountAll({
                limit: limitData,
                offset: offsetData,
                include: [
                    {
                        model: Customer,
                        attributes: ['nama_customer']
                    },
                    {
                        model: Transaksi,
                        attributes: ['createdAt']
                    }
                ]
            })
            dataTestimoni = rows;

            const totalPages = Math.ceil(totalCount / limitData);

            return res.status(200).json({
                data: dataTestimoni,
                page: pageData,
                page_size: limitData,
                total_page: totalPages,
                total_items: totalCount
            })
        } else {
            const testimoni = await Testimoni.findAll({
                include: [
                    {
                        model: Customer,
                        attributes: ['nama_customer']
                    },
                    {
                        model: Transaksi,
                        attributes: ['createdAt']
                    }
                ]
            });
            dataTestimoni = testimoni;

            const totalPages = Math.ceil(totalCount / dataTestimoni.length);
            return res.status(200).json({
                data: dataTestimoni,
                page: 1,
                page_size: dataTestimoni.length,
                total_page: totalPages,
                total_items: totalCount
            });
        }

    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getTestimoni = async (req, res) => {
    try {
        const transaksi_id = req.params.transaksi_id;

        const testimoni = await Testimoni.findAll({
            where: {
                transaksi_id: transaksi_id
            },
            include: [
                {
                    model: Customer,
                    attributes: ['nama_customer']
                },
                {
                    model: Transaksi,
                    attributes: ['createdAt']
                }
            ]
        });
        if (!testimoni) {
            return res.status(404).json({
                status: 'error',
                message: 'Testimoni tidak ditemukan'
            });
        }

        if (testimoni.length === 0) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Testimoni tidak ditemukan'
            })
        }
        return res.status(200).json({
            status: 'success',
            data: testimoni
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.updateTestimoni = async (req, res) => {
    try {
        const id = req.params.id;
        const { customer_id, transaksi_id, testimoni, tanggal } = req.body;
        const testimoniData = await Testimoni.findByPk(id);
        if (!testimoniData) {
            return res.status(404).json({
                status: 'error',
                message: 'Testimoni tidak ditemukan'
            });
        }
        const data = await testimoniData.update({
            customer_id,
            transaksi_id,
            testimoni,
            tanggal
        });
        return res.status(200).json({
            status: 'success',
            message: 'Testimoni berhasil diperbarui',
            data: {
                testimoni: data
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.deleteTestimoni = async (req, res) => {
    try {
        const id = req.params.id;

        const testimoniData = await Testimoni.findByPk(id);
        if (!testimoniData) {
            return res.status(404).json({
                status: 'error',
                message: 'Testimoni tidak ditemukan'
            });
        }
        await Testimoni.destroy({
            where: {
                id
            }
        });
        return res.status(200).json({
            status: 'success',
            message: 'Testimoni berhasil dihapus'
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}