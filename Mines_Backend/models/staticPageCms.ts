import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const StaticPageCMS = sequelize.define(
  'StaticPageCMS',
  {
    admin_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    about_image: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    about_text: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    howtoplay_image: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    howtoplay_text: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    rules_image: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    rules_text: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    tc_image: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    tc_text: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['admin_id'],
      },
    ],
  },
)
