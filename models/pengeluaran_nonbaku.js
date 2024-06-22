'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengeluaran_Nonbaku extends Model {
    static associate(models) {
    }
  }
  Pengeluaran_Nonbaku.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Nama harus diisi"
        }
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Qty harus diisi"
        }
      }
    },
    jumlah_pengeluaran: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Harga harus diisi"
        }
      }
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true
    },

  }, {
    sequelize,
    modelName: 'Pengeluaran_Nonbaku',
  });
  return Pengeluaran_Nonbaku;
};