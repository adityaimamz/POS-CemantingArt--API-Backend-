const { Transaksi, DetailTransaksi, Stok, HargaJual, Rekap, Customer, Produk } = require('../models');
const { Op } = require("sequelize");

exports.storeTransaksi = async (req, res) => {
  try {
    const { produk, tanggal, uang_dibayar, customer_id, metode_pembayaran, status } = req.body;

    if (!produk || produk.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Produk harus dipilih",
      });
    }

    if (status !== "PO" && (!uang_dibayar || !metode_pembayaran)) {
      return res.status(400).json({
        status: "error",
        message: "Jumlah uang dibayar dan metode pembayaran harus diisi jika tidak Pre Order",
      });
    }

    let totalHarga = 0; 
    const detailTransaksiArray = [];
    const stokArray = [];

    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(400).json({
        status: "error",
        message: "Customer tidak ditemukan",
      });
    }

    const transaksi = await Transaksi.create({
      status,
      total_harga: 0,
      uang_dibayar,
      catatan: req.body.catatan,
      metode_pembayaran,
      customer_id,
      tanggal,
    });

    for (const item of produk) {
      const { produk_id, qty } = item;
      const hargaJual = await HargaJual.findOne({
        where: { produk_id },
        order: [["createdAt", "DESC"]],
      });

      if (!hargaJual) {
        return res.status(400).json({
          status: "error",
          message: `Harga jual untuk produk ID ${produk_id} tidak ditemukan`,
        });
      }
      totalHarga += hargaJual.harga_jual * qty;
      const detailTransaksi = await DetailTransaksi.create({
        transaksi_id: transaksi.id,
        produk_id,
        qty,
        harga_jual: hargaJual.harga_jual,
      });
      detailTransaksiArray.push(detailTransaksi);

      if (transaksi.status === "Paid") {
        const stok = await Stok.create({
          produk_id,
          transaksi_id: transaksi.id,
          qty,
          tipe_stok: "stok_keluar",
          harga_produksi: null,
          tanggal,
        });
        stokArray.push(stok);
      }
    }
    const kembalian = uang_dibayar - totalHarga;

    await transaksi.update({ total_harga: totalHarga, kembalian });
    if (transaksi.status === "Paid") {
      await Rekap.create({
        transaksi_id: transaksi.id,
        pengeluaran_id: null,
        tipe: "pendapatan",
        nominal: totalHarga,
      });
    }

    const rekap = await Rekap.findOne({
      where: { transaksi_id: transaksi.id },
    });
    
    return res.status(201).json({
      status: "success",
      message: "Transaksi berhasil disimpan",
      data: {
        transaksi,
        detailTransaksi: detailTransaksiArray,
        stok: stokArray,
        rekap,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};



exports.updateTransaksi = async (req, res) => {
  try {
    const id = req.params.id;
    const { uang_dibayar, catatan, metode_pembayaran, tanggal, customer_id } = req.body;

    // Validasi bahwa uang_dibayar dan metode_pembayaran harus diisi
    if (!uang_dibayar || !metode_pembayaran) {
      return res.status(400).json({
        status: "error",
        message: "Jumlah uang dibayar dan metode pembayaran harus diisi",
      });
    }

    // Find the transaction to be updated
    const transaksi = await Transaksi.findByPk(id, {
      include: [DetailTransaksi],
    });

    if (!transaksi) {
      return res.status(404).json({
        status: "error",
        message: "Transaksi tidak ditemukan",
      });
    }

    // Update the status to 'Paid' and fill in the amount paid
    let totalHarga = transaksi.total_harga;
    let kembalian = 0;

    // Calculate change
    kembalian = uang_dibayar - totalHarga;

    // Update status to 'Paid'
    await transaksi.update({
      status: "Paid",
      uang_dibayar,
      catatan,
      metode_pembayaran,
      kembalian,
      tanggal,
      customer_id,
    });

    // If the transaction status is 'Paid', add the data to the Rekap table
    if (transaksi.status === "Paid") {
      await Rekap.create({
        transaksi_id: transaksi.id,
        pengeluaran_id: null,
        tipe: "pendapatan",
        nominal: totalHarga,
      });

      // Add stock from DetailTransaksi
      for (const detail of transaksi.DetailTransaksis) {
        await Stok.create({
          transaksi_id: transaksi.id,
          produk_id: detail.produk_id,
          qty: detail.qty,
          tipe_stok: "stok_keluar",
          tanggal,
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Transaksi berhasil diperbarui",
      data: {
        transaksi,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
exports.getAllTransaksi = async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { '$Customer.nama_customer$': { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalCount = await Transaksi.count({
      include: [
        {
          model: Customer,
          where: whereConditions
        }
      ]
    });
    const pageData = page * 1 || 1;
    const limitData = limit * 1 || 9;
    const offsetData = (pageData - 1) * limitData;

    const { rows } = await Transaksi.findAndCountAll({
      limit: limitData,
      offset: offsetData,
      include: [
        {
          model: DetailTransaksi,
          attributes: ['produk_id', 'qty', 'harga_jual'],
          include: [
            {
              model: Produk,
              attributes: ['nama']
            }
          ]
        },
        {
          model: Customer,
          attributes: ['nama_customer'],
          where: whereConditions
        },
      ]
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
      status: 'error',
      message: error.message
    });
  }
};
exports.getPaidTransaksi = async (req, res) => {
  try {

    const { search, page, limit } = req.query;

    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { '$Customer.nama_customer$': { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalCount = await Transaksi.count({
      where: { status: 'Paid' },
      include: [
        {
          model: Customer,
          where: whereConditions
        }
      ]
    })

    const pageData = page * 1 || 1;
    const limitData = limit * 1 || 9;
    const offsetData = (pageData - 1) * limitData;

    const { rows } = await Transaksi.findAndCountAll({
      where: { status: 'Paid' },
      limit: limitData,
      offset: offsetData,
      include: [
        {
          model: DetailTransaksi,
          attributes: ['produk_id', 'qty', 'harga_jual'],
          include: [
            {
              model: Produk,
              attributes: ['nama']
            }
          ]
        },
        {
          model: Customer,
          attributes: ['nama_customer'],
          where: whereConditions
        }
      ]
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
      status: 'error',
      message: error.message
    });
  }
}

exports.getPOTransaksi = async (req, res) => {
  try {

    const { search, page, limit } = req.query;

    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { '$Customer.nama_customer$': { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalCount = await Transaksi.count({
      where: { status: 'PO' },
      include: [
        {
          model: Customer,
          where: whereConditions
        }
      ]
    })

    const pageData = page * 1 || 1;
    const limitData = limit * 1 || 9;
    const offsetData = (pageData - 1) * limitData;

    const { rows } = await Transaksi.findAndCountAll({
      where: { status: 'PO' },
      limit: limitData,
      offset: offsetData,
      include: [
        {
          model: DetailTransaksi,
          attributes: ['produk_id', 'qty', 'harga_jual'],
          include: [
            {
              model: Produk,
              attributes: ['nama']
            }
          ]
        },
        {
          model: Customer,
          attributes: ['nama_customer'],
          where: whereConditions
        },
      ]
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
      status: 'error',
      message: error.message
    });
  }
}

exports.getTransaksi = async (req, res) => {
  try {
    const id = req.params.id
    const transaksi = await Transaksi.findByPk(id, {
      include: [
        {
          model: DetailTransaksi,
          attributes: ['produk_id', 'qty', 'harga_jual'],
          include: [
            {
              model: Produk,
              attributes: ['nama']
            }
          ]
        },
        {
          model: Customer,
          attributes: ['nama_customer']
        },
      ]
    })
    if (!transaksi) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan'
      });
    }
    return res.status(200).json({
      data: transaksi
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

exports.deleteTransaksi = async (req, res) => {
  try {
    const id = req.params.id;

    const transaksi = await Transaksi.findByPk(id);
    if (!transaksi) {
      res.status(404);
      throw new Error('Transaksi tidak ditemukan');
    }

    // Hapus terlebih dahulu semua entitas terkait
    await Rekap.destroy({
      where: {
        transaksi_id: id,
        tipe: 'pengeluaran'
      }
    });

    await Stok.destroy({
      where: {
        transaksi_id: id
      }
    });

    await DetailTransaksi.destroy({
      where: {
        transaksi_id: id
      }
    });

    // Kemudian hapus transaksi itu sendiri
    await transaksi.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dihapus'
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};


