'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rekaps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      pengeluaran_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Pengeluaran_Nonbakus',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      nominal: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tipe: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('Rekaps');
  }
};