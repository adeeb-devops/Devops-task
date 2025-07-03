import { Game } from '../models/game'
import { UserAccess } from '../models/user_access'
import { GameCycle } from '../models/game_cycle'
import { Template } from '../models/template'
import { Admin, AdminLogs } from '../models/admin'
import { Distributor, DistributorLogs } from '../models/distributor'
import { Player } from '../models/player'
import { Manager } from '../models/manager'
import { HowToPlay } from '../models/howToPlay'
import { TermsAndConditions } from '../models/termsAndConditions'
import { Rules } from '../models/rules'
import { Message } from '../models/message'
import { StaticPageCMS } from '../models/staticPageCms'
import { FAQ } from '../models/faq'
import { Transaction } from '../models/transaction'
import { Maintenance } from '../models/maintenance'

Template.hasMany(Game, { foreignKey: 'template_id', as: 'game_array' })

Game.belongsTo(Template, {
  foreignKey: 'template_id',
  targetKey: 'id',
  as: 'template',
})

Player.belongsTo(Distributor, {
  foreignKey: 'organization_id',
  targetKey: 'distributor_id',
  as: 'organizationHead',
})

Player.belongsTo(Distributor, {
  foreignKey: 'super_distributor',
  targetKey: 'distributor_id',
  as: 'playerSuperDistributor',
})

Player.belongsTo(Distributor, {
  foreignKey: 'distributor',
  targetKey: 'distributor_id',
  as: 'playerDistributor',
})

Player.belongsTo(Distributor, {
  foreignKey: 'sub_distributor',
  targetKey: 'distributor_id',
  as: 'playerSubDistributor',
})

Player.belongsTo(Distributor, {
  foreignKey: 'retailer',
  targetKey: 'distributor_id',
  as: 'playerRetailer',
})

Player.belongsTo(Distributor, {
  foreignKey: 'created_by',
  targetKey: 'distributor_id',
  as: 'createdByDistributor',
})

Distributor.belongsTo(Distributor, {
  foreignKey: 'parent_id',
  as: 'parent',
})

Manager.belongsTo(Distributor, {
  foreignKey: 'distributor_id',
  targetKey: 'distributor_id',
  as: 'managerDistributor',
})

Rules.belongsTo(Admin, {
  foreignKey: 'created_by',
  targetKey: 'id',
  as: 'admin',
})

TermsAndConditions.belongsTo(Admin, {
  foreignKey: 'created_by',
  targetKey: 'id',
  as: 'admin',
})

HowToPlay.belongsTo(Admin, {
  foreignKey: 'created_by',
  targetKey: 'id',
  as: 'admin',
})

Admin.hasMany(HowToPlay, {
  foreignKey: 'created_by',
  as: 'howToPlay',
})

Admin.hasMany(TermsAndConditions, {
  foreignKey: 'created_by',
  as: 'termsAndConditions',
})

Admin.hasMany(Rules, {
  foreignKey: 'created_by',
  as: 'rules',
})

Message.belongsTo(Admin, {
  foreignKey: 'created_by',
  targetKey: 'id',
  as: 'admin',
})

Message.belongsTo(Distributor, {
  foreignKey: 'client_id',
  targetKey: 'distributor_id',
  as: 'distributor',
})

Admin.hasMany(Message, {
  foreignKey: 'created_by',
  as: 'message',
})

Distributor.hasMany(Message, {
  foreignKey: 'client_id',
  as: 'message',
})

Admin.hasMany(FAQ, {
  foreignKey: 'created_by',
  as: 'faq',
})

FAQ.belongsTo(Admin, {
  foreignKey: 'created_by',
  targetKey: 'id',
  as: 'admin',
})

Transaction.belongsTo(Player, {
  foreignKey: 'player_name',
  targetKey: 'player_name',
  as: 'player',
})

Player.hasMany(Transaction, {
  foreignKey: 'player_name',
  sourceKey: 'player_name',
  as: 'transactions',
})

Game.belongsTo(Player, {
  foreignKey: 'player_name',
  targetKey: 'player_name',
  as: 'player',
})

Player.hasMany(Game, {
  foreignKey: 'player_name',
  sourceKey: 'player_name',
  as: 'playerGames',
})

Transaction.belongsTo(Game, {
  foreignKey: 'game_id',
  targetKey: 'game_id',
  as: 'gameTransaction',
})

Game.hasMany(Transaction, {
  foreignKey: 'game_id',
  sourceKey: 'game_id',
  as: 'transactions',
})

export {
  Game,
  UserAccess,
  GameCycle,
  Admin,
  Distributor,
  Player,
  Template,
  AdminLogs,
  DistributorLogs,
  Manager,
  HowToPlay,
  TermsAndConditions,
  Rules,
  Message,
  StaticPageCMS,
  FAQ,
  Transaction,
  Maintenance,
}
