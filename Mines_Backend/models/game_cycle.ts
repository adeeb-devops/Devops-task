import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const GameCycle = sequelize.define(
  'GameCycle',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    current_cycle: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    // cycle_limit: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   defaultValue: 50,
    // },
    // forwarded_winning_amount: {
    //   type: DataTypes.FLOAT,
    //   allowNull: true,
    //   defaultValue: 0.0,
    // },
    winning_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    betted_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_jackpot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // cycle_winning_amount: {
    //   type: DataTypes.FLOAT,
    //   allowNull: true,
    //   defaultValue: 0.0,
    // },
    payout_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.95,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
