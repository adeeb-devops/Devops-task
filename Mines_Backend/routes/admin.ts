import express from 'express'
import { authenticateJwtToken } from '../middleware/authenticator'
import adminController from '../controller/admin'

const router = express.Router()

router.post('/login', adminController.loginAdmin)
router.post('/', authenticateJwtToken, adminController.createAdmin)
router.get('/', authenticateJwtToken, adminController.getAdmin)
router.put('/:id', authenticateJwtToken, adminController.updateAdmin)
router.delete('/:id', authenticateJwtToken, adminController.deleteAdmin)
router.get('/adminlogs', authenticateJwtToken, adminController.getAdminLogs)
router.post('/logout', authenticateJwtToken, adminController.logoutAdmin)
router.patch('/password', authenticateJwtToken, adminController.changePassword)
export default router
