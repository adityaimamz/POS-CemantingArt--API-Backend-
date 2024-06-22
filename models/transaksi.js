'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaksi.hasMany(models.DetailTransaksi, { foreignKey: 'transaksi_id' });
      Transaksi.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    }
  }
  Transaksi.init({
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Paid'
    },
    total_harga: DataTypes.INTEGER,
    uang_dibayar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kembalian: DataTypes.INTEGER,
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metode_pembayaran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal: DataTypes.DATE,
    customer_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaksi',
  });
  return Transaksi;
};