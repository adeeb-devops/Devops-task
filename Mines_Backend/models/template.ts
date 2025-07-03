import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const Template = sequelize.define(
  'Template',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    game_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grid_options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [], // Example: [{ grid_type: '5X5', number_of_tiles: 25 }, { grid_type: '7X7', number_of_tiles: 49 }]
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_jackpot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    jackpot_bonus: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    rake_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    min_bet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_bet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
