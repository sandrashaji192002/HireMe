const db = require('../index');
const { DataTypes } = require('sequelize');
const Job = db.define('Job', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'contract'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  skillsRequired: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

  recruiterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Job;
