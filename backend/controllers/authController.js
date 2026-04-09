import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Регистрация/создание
export const register = async (req, res) => {
  try {
    const { fullName, login, password,department } = req.body;

    // Проверка на существование пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Пользователь успешно создан' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Авторизация
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Неверные учётные данные' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверные учётные данные' });
    }

    // Создание JWT‑токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
