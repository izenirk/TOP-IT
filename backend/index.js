import sequelize from './config/database.js';
import User from './models/User.js';

async function initialize() {
  try {
    // Проверка подключения
    await sequelize.authenticate();
    console.log('Подключение к БД успешно установлено');

    // Синхронизация модели с БД
    await sequelize.sync({ alter: true }); // или { force: true } для полной пересоздания
    console.log('Модели синхронизированы с БД');
  } catch (error) {
    console.error('Ошибка при инициализации:', error);
  }
}

initialize();
