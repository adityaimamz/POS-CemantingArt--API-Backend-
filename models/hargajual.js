'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HargaJual extends Model {
    static associate(models) {
      HargaJual.belongsTo(models.Produk, {
        foreignKey: 'produk_id',
      });
    }
  }
  HargaJual.init({
    harga_jual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Harga jual harus diisi'
        }
      }
    },
    produk_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate: {
        notNull: {
          msg: 'Produk harus diisi'
        }
      }
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'HargaJual',
  });
  return HargaJual;
};
