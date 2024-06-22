'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Testimoni, { foreignKey: 'customer_id' });
      Customer.hasMany(models.Transaksi, { foreignKey: 'customer_id' }, {ondelete: 'CASCADE'});
    }
  }
  Customer.init({
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Nama harus diisi"
        }
      }
    },
    no_telepon: DataTypes.STRING,
    tanggal_lahir: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Customer',
  });
  
  // Tambahkan hook sebelum penghapusan customer
  Customer.beforeDestroy(async (customer, options) => {
    try {
      // Mengosongkan kolom customer_id pada data transaksi terkait
      await sequelize.models.Transaksi.update({ customer_id: null }, {
        where: { customer_id: customer.id }
      });
    } catch (error) {
      throw new Error("Gagal mengosongkan kolom customer_id pada data transaksi.");
    }
  });
  
  
  return Customer;
}; 