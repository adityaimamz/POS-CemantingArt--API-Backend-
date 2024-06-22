'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DetailTransaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DetailTransaksi.belongsTo(models.Transaksi, {
        foreignKey: 'transaksi_id',
      })
      DetailTransaksi.belongsTo(models.Produk, {
        foreignKey: 'produk_id',
      })
    }
  }
  DetailTransaksi.init({
    transaksi_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    produk_id: { type: DataTypes.INTEGER, allowNull: false },
    harga_jual: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'DetailTransaksi',
  });
  return DetailTransaksi;
};