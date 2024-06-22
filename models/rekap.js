'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rekap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Rekap.belongsTo(models.Transaksi, {
        foreignKey: 'transaksi_id',
      });
      Rekap.belongsTo(models.Pengeluaran_Nonbaku, {
        foreignKey: 'pengeluaran_id',
      })
    }
  }
  Rekap.init({
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Transaksis',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    pengeluaran_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Pengeluaran_Nonbakus',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    nominal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nominal harus diisi'
        }
      }
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Type harus diisi'
        }
      }
    },
    tanggal: {
       type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'Rekap',
  });
  return Rekap;
};