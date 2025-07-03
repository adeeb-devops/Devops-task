import express from 'express'
import gameController from '../controller/game'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.get('/details', authenticateJwtToken, gameController.getGameDetails)
router.get('/weight', authenticateJwtToken, gameController.getGameCycle)
router.put('/weight/:id', authenticateJwtToken, gameController.updateGameCycle)

export default router
