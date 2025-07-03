import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'

export const UserAccess = sequelize.define(
  'UserAccess',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    player_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_player_name',
        msg: 'This player name is already taken.',
      },
    },
    socket_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
)
