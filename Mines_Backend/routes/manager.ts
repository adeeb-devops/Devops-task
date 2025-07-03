import express from 'express'
import managerController from '../controller/manager'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.post('/', authenticateJwtToken, managerController.createManager)
router.get('/', authenticateJwtToken, managerController.getManager)
router.put('/:id', authenticateJwtToken, managerController.updateManager)
router.delete('/:id', authenticateJwtToken, managerController.deleteManager)
export default router
