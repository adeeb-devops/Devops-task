import { DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { sequelize } from '../config/db'
import { Template } from './template'
import { Player } from './player'

export const Game = sequelize.define(
  'Game',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Template,
        key: 'id',
      },
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
      unique: true,
    },
    bets: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    game_type: {
      type: DataTypes.ENUM,
      values: ['manual', 'auto'],
      defaultValue: 'manual',
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    tiles_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9,
    },
    mines_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_jackpot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    betting_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    winning_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    jackpot_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    payout_multiplier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (game: any) => {
        const prefix = game.is_jackpot ? 'JM' : 'NM'
        game.game_id = `${prefix}${uuidv4()}`
      },
      afterCreate: async (game, options) => {
        const prefix = game.is_jackpot ? 'JM' : 'NM'
        game.game_id = `${prefix}${game.id}`
        await game.update({ game_id: game.game_id }, { transaction: options.transaction })
      },
    },
  },
)
