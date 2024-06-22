'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengeluaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pengeluaran.belongsTo(models.Produk, {
        foreignKey: 'produk_id',
      });
    }
  }
  Pengeluaran.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "nama harus diisi"
        }
      }
    },
    qty: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "qty harus diisi"
        }
      }
    },
    satuan:{
      type: DataTypes.STRING,
      allowNull: true,

    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "harga harus diisi"
        }
      }
    },
    total: {
      type: DataTypes.INTEGER,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: true
    },
    produk_id : {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Produk harus diisi"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Pengeluaran',
  });
  return Pengeluaran;
};