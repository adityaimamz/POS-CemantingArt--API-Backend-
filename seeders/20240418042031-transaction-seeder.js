'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambahkan data dummy ke tabel Produk
    await queryInterface.bulkInsert('Produks', [
      { nama: 'Produk A', gambar: 'gambar_produk_a.jpg', createdAt: new Date(), updatedAt: new Date() },
      { nama: 'Produk B', gambar: 'gambar_produk_b.jpg', createdAt: new Date(), updatedAt: new Date() },
      // Tambahkan lebih banyak data produk sesuai kebutuhan
    ]);

    // Tambahkan data dummy ke tabel HargaJual
    await queryInterface.bulkInsert('HargaJuals', [
      { harga_jual: 10000, produk_id: 1, createdAt: new Date(), updatedAt: new Date(), tanggal: new Date() }, // Harga jual untuk produk 1
      { harga_jual: 15000, produk_id: 2, createdAt: new Date(), updatedAt: new Date(), tanggal: new Date() }, // Harga jual untuk produk 2
      // Tambahkan lebih banyak data harga jual sesuai kebutuhan
    ]);

    // Tambahkan data dummy ke tabel Customer
    await queryInterface.bulkInsert('Customers', [
      { nama_customer: 'John Doe', no_telepon: '08123456789', tanggal_lahir: '1990-01-01', createdAt: new Date(), updatedAt: new Date() },
      { nama_customer: 'Jane Doe', no_telepon: '08123456788', tanggal_lahir: '1995-01-01', createdAt: new Date(), updatedAt: new Date() },
      // Tambahkan lebih banyak data customer sesuai kebutuhan
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Hapus semua data dari tabel Produk
    await queryInterface.bulkDelete('Produks', null, {});

    // Hapus semua data dari tabel HargaJual
    await queryInterface.bulkDelete('HargaJuals', null, {});

    // Hapus semua data dari tabel Customer
    await queryInterface.bulkDelete('Customers', null, {});
  }
};
