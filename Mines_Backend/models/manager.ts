import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'
import { Distributor } from './distributor'

export const Manager: any = sequelize.define(
  'Manager',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_phone_number',
        msg: 'This phone number is already taken.',
      },
    },
    manager_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    manager_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distributor_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    role: {
      type: DataTypes.ENUM,
      values: ['manager'],
      defaultValue: 'manager',
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'inactive'],
      defaultValue: 'active',
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    system_ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sharing_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sharing_percentage: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
)
