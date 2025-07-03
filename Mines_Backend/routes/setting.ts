import express from 'express'
import settingController from '../controller/setting'
const router = express.Router()

router.get('/setting/payOuts', settingController.payOuts)

export default router
