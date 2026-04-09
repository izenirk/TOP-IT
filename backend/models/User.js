import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // путь к вашему экземпляру sequelize

const User = sequelize.define('User', {
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name',
    validate: {
      notEmpty: {
        msg: 'ФИО не может быть пустым'
      },
      len: {
        args: [2, 255],
        msg: 'ФИО должно содержать от 2 до 255 символов'
      }
    }
  },
  login: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Этот логин уже занят'
    },
    validate: {
      notEmpty: {
        msg: 'Логин не может быть пустым'
      },
      len: {
        args: [3, 50],
        msg: 'Логин должен содержать от 3 до 50 символов'
      },
      isAlphanumeric: {
        msg: 'Логин может содержать только буквы и цифры'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Пароль не может быть пустым'
      },
      len: {
        args: [6, 100],
        msg: 'Пароль должен содержать минимум 6 символов'
      }
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'department',
    validate: {
      notEmpty: {
        msg: 'Подразделение не может быть пустым'
      }
    }
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'group',
    validate: {
      notEmpty: {
        msg: 'Группа не может быть пустой'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default User;
