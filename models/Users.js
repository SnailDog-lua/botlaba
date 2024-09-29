// models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    totalMessagesEncrypted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    zamenaMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    tritemiusMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    vigenereMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    vernamMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    mcMillanMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

module.exports = User;
