'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Stoks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      produk_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Produks',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      transaksi_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Transaksis',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      harga_produksi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tipe_stok: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tanggal: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Stoks');
  }
};