'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stok extends Model {
    static associate(models) {
      Stok.belongsTo(models.Produk, {
        foreignKey: 'produk_id',
      });   
      
    }
  }
  Stok.init({
    produk_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Produk harus diisi'
        }
      }
    },
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    harga_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Qty harus diisi'
        }
      }
    },
    tipe_stok: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Tipe stok harus diisi'
        }
      }
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Stok',
  });
  return Stok;
};
