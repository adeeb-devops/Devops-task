import express from 'express'
import reportController from '../controller/report'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.get('/player-report', authenticateJwtToken, reportController.getUserReport)
router.get('/daily-report', authenticateJwtToken, reportController.getDailyReport)
router.get('/game-report', authenticateJwtToken, reportController.getGameReport)
router.get('/downline-settlement-report', authenticateJwtToken, reportController.getDownlineSettlementReport)
router.get('/upline-settlement-report', authenticateJwtToken, reportController.getUplineSettlementReport)

export default router
