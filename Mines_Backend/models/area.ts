import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const Area: any = sequelize.define(
  'Area',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: 'unique_area_name',
        msg: 'This area name is already taken.',
      },
    },
    pin_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'inactive'],
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
