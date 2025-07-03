import express from 'express'
import userController from '../controller/player'
import { authenticateJwtToken, authenticateTokenCms } from '../middleware/authenticator'

const router = express.Router()

router.post('/login', userController.login)
router.post('/platform-login', userController.platformLogin)
router.post('/', authenticateJwtToken, userController.createPlayer)
router.get('/', authenticateJwtToken, userController.getPlayers)
router.put('/changeStatus', authenticateJwtToken, userController.changeStatus)
router.put('/:id', authenticateJwtToken, userController.updatePlayer)
router.delete('/:id', authenticateJwtToken, userController.deletePlayer)
router.put('/updatePlayerName/:id', authenticateJwtToken, userController.updatePlayerName)
router.get('/getBalance', authenticateJwtToken, userController.getBalance)
router.get('/lobby/balance', authenticateTokenCms, userController.getPlayerBalance)
router.get('/info/:playerName', authenticateTokenCms, userController.getPlayerInfo)
router.patch('/update/balance', authenticateTokenCms, userController.updatePlayerBalance)
router.get('/verify', userController.getTokenData)
router.get('/livepl', authenticateJwtToken, userController.getPlayerLivePL)

export default router
