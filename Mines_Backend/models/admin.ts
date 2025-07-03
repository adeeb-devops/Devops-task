import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_phone_number',
        msg: 'This phone number is already taken.',
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_username',
        msg: 'This username is already taken.',
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      values: ['master_admin', 'admin'],
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'blocked'],
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)

export const AdminLogs: any = sequelize.define(
  'AdminLogs',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Admin,
        key: 'username',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipaddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actionName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
