
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname в ES6-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Корректный абсолютный путь к файлу БД
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log, // Для отладки — покажет все SQL-запросы
});

export default sequelize;