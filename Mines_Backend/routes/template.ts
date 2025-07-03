import express from 'express'
import lobbyController from '../controller/template'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.get('/', authenticateJwtToken, lobbyController.getTemplate)
router.post('/', authenticateJwtToken, lobbyController.addTemplate)
router.patch('/:id', authenticateJwtToken, lobbyController.updateTemplate)
router.delete('/:id', authenticateJwtToken, lobbyController.deleteTemplate)

export default router
