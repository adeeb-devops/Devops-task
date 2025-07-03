export const constants = {
  masterAdmin: 'master_admin',
  admin: 'admin',
}

const broadcastEndpointsMap: Record<string, string[]> = {
  DEV: ['https://platform_backend.rexgames.in/user/gameStatus', 'https://qgplatform.rexgames.in/contest/gameData'],
  PROD: [
    'https://platform_backend.rexgames.in/user/gameStatus',
    'https://qg-plaform-backend.prod.rexgames.in/contest/gameData',
  ],
}

export const broadcastEndpoints = broadcastEndpointsMap[process.env.NODE_ENV || 'DEV']
