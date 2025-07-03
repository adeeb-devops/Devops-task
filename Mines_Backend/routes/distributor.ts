import express from 'express'
import distributorController from '../controller/distributor'
import { authenticateJwtToken } from '../middleware/authenticator'

const router = express.Router()

router.post('/login', distributorController.login)
router.post('/', authenticateJwtToken, distributorController.createDistributor)
router.get('/', authenticateJwtToken, distributorController.getDistributor)
router.put('/:id', authenticateJwtToken, distributorController.updateDistributor)
router.delete('/:id', authenticateJwtToken, distributorController.deleteDistributor)

router.get('/filter', authenticateJwtToken, distributorController.filterDistributor)
router.get('/distributorlogs', authenticateJwtToken, distributorController.getDistributorLogs)
router.patch('/password', authenticateJwtToken, distributorController.changeDistributorKey)
router.post('/logout', authenticateJwtToken, distributorController.logoutDistributor)

export default router
