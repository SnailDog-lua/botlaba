// db.js
const { Sequelize } = require('sequelize');

// Подключение к базе данных PostgreSQL
const sequelize = new Sequelize('encryption_bot', 'postgres', 'AfAs6nGg!', {
    host: 'localhost',
    dialect: 'postgres'
});

sequelize.authenticate()
    .then(() => console.log('Подключение к базе данных успешно установлено.'))
    .catch(err => console.error('Ошибка подключения к базе данных:', err));

module.exports = sequelize;
