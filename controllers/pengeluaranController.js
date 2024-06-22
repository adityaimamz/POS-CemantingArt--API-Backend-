const { Pengeluaran, Produk } = require("../models");
const { Op } = require("sequelize");

exports.getAllPengeluaran = async (req, res) => {
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
    const totalCount = await Pengeluaran.count({ where: whereCondition });

    const pageData = page * 1 || 1;
    const limitData = limit * 1 || 9;
    const offsetData = (pageData - 1) * limitData;

    const { rows } = await Pengeluaran.findAndCountAll({
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

exports.getPengeluaran = async (req, res) => {
  try {
    const pengeluaran = await Pengeluaran.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!pengeluaran) {
      return res.status(404).json({
        status: "error",
        message: "Pengeluaran tidak ditemukan",
      });
    }
    return res.status(200).json({
      data: pengeluaran,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.storePengeluaran = async (req, res) => {
  try {
    const { nama, qty, satuan, harga, tanggal, produk_id } = req.body;
    const total = qty * harga;

    if (!nama || !qty || !harga || !produk_id) {
      return res.status(400).json({
        status: "error",
        message: "Nama, qty, harga dan produk_id harus diisi",
      })
    }
    const produk = await Produk.findByPk(produk_id);
    if (!produk) {
      return res.status(404).json({
        status: "Not Found",
        message: "Produk tidak ditemukan",
      })
    }
    const pengeluaran = await Pengeluaran.create({
      nama,
      qty,
      satuan,
      harga,
      total,
      tanggal,
      produk_id,
    });
    return res.status(201).json({
      data: pengeluaran,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updatePengeluaran = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, satuan, qty, harga, tanggal, produk_id } = req.body;

    // Hitung total baru
    const total = qty * harga;

    await Pengeluaran.update(
      { nama, satuan, qty, harga, total, tanggal, produk_id },
      {
        where: {
          id: id,
        },
      }
    );

    const updatePengelauran = await Pengeluaran.findByPk(id);
    if (!updatePengelauran) {
      res.status(404);
      throw new Error("Pengeluaran tidak ditemukan");
    }
    return res.status(200).json({
      data: updatePengelauran,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deletePengeluaran = async (req, res) => {
  try {
    const id = req.params.id;
    const idPengeluaran = await Pengeluaran.findByPk(id);

    if (!idPengeluaran) {
      res.status(404);
      throw new Error("Pengeluaran tidak ditemukan");
    }

    await Pengeluaran.destroy({
      where: {
        id: id,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Pengeluaran berhasil di hapus",
    })
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
