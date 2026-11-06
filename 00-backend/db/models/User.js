const db = require('../index');
const { DataTypes } = require('sequelize');
const User = db.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', value.trim().toLowerCase());
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'recruiter'),
    allowNull: false,
    defaultValue: 'student',
  },
  profileImageUrl: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING,
  },
  githubUrl: {
    type: DataTypes.STRING,
  },
  linkedinUrl: {
    type: DataTypes.STRING,
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  education: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  experience: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  resumeUrl: {
    type: DataTypes.STRING,
  },
});

module.exports = User;
