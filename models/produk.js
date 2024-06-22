'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Produk extends Model {
    static associate(models) {
      Produk.hasMany(models.Stok, {
        foreignKey: 'produk_id',
      });
      Produk.hasMany(models.HargaJual, {
        foreignKey: 'produk_id',
      });
      Produk.hasMany(models.DetailTransaksi, {
        foreignKey: 'produk_id',
      });
      Produk.hasMany(models.Pengeluaran, {
        foreignKey: 'produk_id',
      })
    }
  }
  Produk.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nama Produk harus diisi'
        }
      }
    },
    gambar: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Produk',
  });

  return Produk;
};
