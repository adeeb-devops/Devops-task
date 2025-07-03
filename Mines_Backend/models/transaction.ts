import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'
import { Game, Player } from '../config'

export const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    player_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Player,
        key: 'player_name',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    game_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Game,
        key: 'game_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    transaction_type: {
      type: DataTypes.ENUM,
      values: ['bet-win', 'refund', 'credit', 'deduct'],
      allowNull: true,
      defaultValue: 'bet-win',
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    winning_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    betting_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    opening_balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    closing_balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    commission_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
