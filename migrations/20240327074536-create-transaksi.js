'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Paid",
      },
      total_harga: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uang_dibayar: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      kembalian: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      catatan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metode_pembayaran: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Customers',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tanggal: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: true,
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
    await queryInterface.dropTable('Transaksis');
  }
};