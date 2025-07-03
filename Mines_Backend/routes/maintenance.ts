import express from 'express'
import maintenanceController from '../controller/maintenance'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.put('/', authenticateJwtToken, maintenanceController.initiateMaintenance)
router.get('/', authenticateJwtToken, maintenanceController.getAllMaintenance)
router.patch('/:id', authenticateJwtToken, maintenanceController.updateMaintenance)
router.delete('/:id', authenticateJwtToken, maintenanceController.deleteMaintenance)

export default router
