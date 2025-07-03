import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'
import { Distributor } from './distributor'
import { Admin } from './admin'

export const Player: any = sequelize.define(
  'Player',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    player_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: 'unique_player_id',
        msg: 'This player id is already taken.',
      },
    },
    player_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: 'unique_player_name',
        msg: 'This player name is already taken by other distributor.',
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: 'unique_phone_number',
        msg: 'This phone number is already taken.',
      },
    },
    organization_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'inactive'],
      defaultValue: 'active',
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    player_type: {
      type: DataTypes.ENUM,
      values: ['real', 'cash'],
      defaultValue: 'real',
    },
    total_net_sharing: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    sound: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    vibration: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    created_by_admin: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Admin,
        key: 'username',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    super_distributor: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    distributor: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    sub_distributor: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    retailer: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    device_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    system_ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    app_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    device_model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_unique_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['organization_id'],
      },
      {
        fields: ['player_id'],
      },
      {
        fields: ['player_name'],
      },
      {
        fields: ['phone_number'],
      },
    ],
    hooks: {
      beforeValidate: (user: any) => {
        if (user.organization_id && user.username) {
          user.player_id = `${user.organization_id}_${user.username}`
        }
      },
    },
  },
)

Player.addScope('activeUser', {
  where: { status: 'active' },
})
