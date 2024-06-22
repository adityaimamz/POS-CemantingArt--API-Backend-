'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Testimoni extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Testimoni.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
      });
      Testimoni.belongsTo(models.Transaksi, {
        foreignKey: 'transaksi_id',
      })
    }
  }
  Testimoni.init({
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Transaksi harus diisi"
        }
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Customer harus diisi"
        }
      }
    },
    testimoni: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Testimoni harus diisi"
        }
      }
    },
    tanggal: {
       type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'Testimoni',
  });
  return Testimoni;
};