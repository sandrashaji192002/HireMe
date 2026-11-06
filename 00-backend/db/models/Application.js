const db = require('../index');
const { DataTypes } = require('sequelize');
const Application = db.define(
  'Application',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    //FK to job
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    //FK to user
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coverNote: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('applied', 'reviewed', 'shortlisted', 'rejected'),
      defaultValue: 'applied',
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ['jobId', 'studentId'] }],
  }
);
module.exports = Application;
