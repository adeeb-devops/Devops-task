import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db'
import { Admin } from './admin'

export const Distributor = sequelize.define(
  'Distributor',
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
    organization_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'distributors',
        key: 'distributor_id',
      },
      onDelete: 'CASCADE',
    },
    distributor_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    distributor_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['super_distributor', 'distributor', 'sub_distributor', 'retailer'],
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
    wallet_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallet_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sharing_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sharing_percentage: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'distributors',
        key: 'distributor_id',
      },
      onDelete: 'CASCADE',
    },
    created_by_admin: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Admin,
        key: 'username',
      },
      onDelete: 'CASCADE',
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distributors',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    is_default: {
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

export const DistributorLogs: any = sequelize.define(
  'DistributorLogs',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    distributor_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Distributor,
        key: 'distributor_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    parent_super_distributor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_distributor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_sub_distributor: {
      type: DataTypes.STRING,
      allowNull: true,
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
