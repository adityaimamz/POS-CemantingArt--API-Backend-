const { Rekap, Transaksi, Pengeluaran_Nonbaku, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require("sequelize");

exports.getAllRekap = async (req, res) => {
    try {
        const { search, page, limit } = req.query;

        const whereCondition = {}; // Kondisi awal untuk query pencarian

        if (search) {
            // Jika ada query pencarian, tambahkan kondisi pencarian
            whereCondition[Op.or] = [
                { tipe: { [Op.like]: `%${search}%` } }
            ];
        }

        // Menghitung jumlah total item setelah pencarian
        const totalCount = await Rekap.count({ where: whereCondition });

        const pageData = page * 1 || 1;
        const limitData = limit * 1 || 9;
        const offsetData = (pageData - 1) * limitData;

        const { rows } = await Rekap.findAndCountAll({
            limit: limitData,
            offset: offsetData,
            include: [
                {
                    model: Pengeluaran_Nonbaku,
                    attributes: ['nama']
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

exports.getRekap = async (req, res) => {
    try {
        const id = req.params.id
        const rekap = await Rekap.findByPk(id, {
            include: [
                {
                    model: Pengeluaran_Nonbaku,
                    attributes: ['nama']
                }
            ]
        })
        if (!rekap) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Data rekap tidak ditemukan',
            })
        }
        return res.status(200).json({
            data: rekap,
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
}


exports.getLaporanByMonth = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month || !/^(0?[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({
                status: 'error',
                message: 'Bulan harus dalam format angka antara 1 dan 12'
            });
        }

        const query = `
        WITH paid_transactions AS (
            SELECT SUM(total_harga) AS total_sales
            FROM \`ecoprint\`.\`Transaksis\`
            WHERE \`ecoprint\`.\`Transaksis\`.\`status\` = 'Paid' AND
                  MONTH(\`ecoprint\`.\`Transaksis\`.\`createdAt\`) = ?
        ),
        stok_masuk AS (
            SELECT SUM(\`ecoprint\`.\`Stoks\`.\`harga_produksi\` * \`ecoprint\`.\`Stoks\`.\`qty\`) AS stok_masuk_cost
            FROM \`ecoprint\`.\`Stoks\`
            WHERE \`ecoprint\`.\`Stoks\`.\`tipe_stok\` = 'stok_masuk' AND
                  MONTH(\`ecoprint\`.\`Stoks\`.\`createdAt\`) = ?
        ),
        nonbakus_expenses AS (
            SELECT SUM(\`ecoprint\`.\`Pengeluaran_Nonbakus\`.\`jumlah_pengeluaran\`) AS total_nonbakus_expenses
            FROM \`ecoprint\`.\`Pengeluaran_Nonbakus\`
            WHERE MONTH(\`ecoprint\`.\`Pengeluaran_Nonbakus\`.\`createdAt\`) = ?
        )
        SELECT
            total_sales AS Total_Transaksi_Penjualan,
            stok_masuk_cost AS Harga_Pokok,
            GROUP_CONCAT(CONCAT(\`ecoprint\`.\`Pengeluaran_Nonbakus\`.\`nama\`, ': ', \`ecoprint\`.\`Pengeluaran_Nonbakus\`.\`qty\`,
            ':', \`ecoprint\`.\`Pengeluaran_Nonbakus\`.\`jumlah_pengeluaran\`) SEPARATOR '\n') AS Beban,
            (total_nonbakus_expenses + stok_masuk_cost) AS Total_Beban,
            (total_sales - (total_nonbakus_expenses + stok_masuk_cost)) AS Laba_Bersih,
            ? AS Bulan
        FROM \`ecoprint\`.\`Pengeluaran_Nonbakus\`
        JOIN paid_transactions ON 1=1
        JOIN stok_masuk ON 1=1
        JOIN nonbakus_expenses ON 1=1
        ;
        `;

        const results = await sequelize.query(query, {
            replacements: [month, month, month, month],
            type: QueryTypes.SELECT
        });

        return res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};


/* 
const query = `
        SELECT
            (SELECT SUM(\`zanovmyi_ecoprint\`.\`Transaksis\`.\`total_harga\`)
             FROM \`zanovmyi_ecoprint\`.\`Transaksis\`
             WHERE (\`zanovmyi_ecoprint\`.\`Transaksis\`.\`status\` = 'Paid'
                    AND MONTH(\`zanovmyi_ecoprint\`.\`Transaksis\`.\`createdAt\`) = ?)) AS \`Total Transaksi Penjualan\`,
            (SELECT SUM((\`zanovmyi_ecoprint\`.\`Stoks\`.\`harga_produksi\` * \`zanovmyi_ecoprint\`.\`Stoks\`.\`qty\`))
             FROM \`zanovmyi_ecoprint\`.\`Stoks\`
             WHERE (\`zanovmyi_ecoprint\`.\`Stoks\`.\`tipe_stok\` = 'stok_masuk'
                    AND MONTH(\`zanovmyi_ecoprint\`.\`Stoks\`.\`createdAt\`) = ?)) AS \`Harga Pokok\`,
            GROUP_CONCAT(CONCAT(\`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`nama\`, ': ', \`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`qty\`, ':', \`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`jumlah_pengeluaran\`) SEPARATOR '\n') AS \`Beban\`,
            ((SELECT SUM(\`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`jumlah_pengeluaran\`)
              FROM \`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`
              WHERE MONTH(\`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`createdAt\`) = ?) +
             (SELECT SUM((\`zanovmyi_ecoprint\`.\`Stoks\`.\`harga_produksi\` * \`zanovmyi_ecoprint\`.\`Stoks\`.\`qty\`))
              FROM \`zanovmyi_ecoprint\`.\`Stoks\`
              WHERE (\`zanovmyi_ecoprint\`.\`Stoks\`.\`tipe_stok\` = 'stok_masuk'
                     AND MONTH(\`zanovmyi_ecoprint\`.\`Stoks\`.\`createdAt\`) = ?))) AS \`Total Beban\`,
            ((SELECT SUM(\`zanovmyi_ecoprint\`.\`Transaksis\`.\`total_harga\`)
              FROM \`zanovmyi_ecoprint\`.\`Transaksis\`
              WHERE (\`zanovmyi_ecoprint\`.\`Transaksis\`.\`status\` = 'Paid'
                     AND MONTH(\`zanovmyi_ecoprint\`.\`Transaksis\`.\`createdAt\`) = ?)) -
             ((SELECT SUM(\`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`jumlah_pengeluaran\`)
               FROM \`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`
               WHERE MONTH(\`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`.\`createdAt\`) = ?) +
              (SELECT SUM((\`zanovmyi_ecoprint\`.\`Stoks\`.\`harga_produksi\` * \`zanovmyi_ecoprint\`.\`Stoks\`.\`qty\`))
               FROM \`zanovmyi_ecoprint\`.\`Stoks\`
               WHERE (\`zanovmyi_ecoprint\`.\`Stoks\`.\`tipe_stok\` = 'stok_masuk'
                      AND MONTH(\`zanovmyi_ecoprint\`.\`Stoks\`.\`createdAt\`) = ?)))) AS \`Laba Bersih\`,
            ? AS \`Bulan\`
        FROM \`zanovmyi_ecoprint\`.\`Pengeluaran_Nonbakus\`;
    `;

        const results = await sequelize.query(query, {
            replacements: [month, month, month, month, month, month, month, month],
            type: QueryTypes.SELECT
        });
*/