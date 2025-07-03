import express from 'express'
import upload from '../middleware/uploadImage'
import cmsController from '../controller/cms'
import { authenticateTokenCms } from '../middleware/authenticator'

const router = express.Router()

router.get('/static_page_cms', authenticateTokenCms, cmsController.getStaticPageCMSByGameType)
router.put(
  '/static_page_cms',
  authenticateTokenCms,
  upload.single('image'),
  cmsController.updateStaticPageCMSOrCreateNew,
)
router.get('/howToPlay', authenticateTokenCms, cmsController.getHowToPlayQuestions)
router.get('/howToPlay/:id', authenticateTokenCms, cmsController.getHowToPlayQuestionById)
router.post('/howToPlay', authenticateTokenCms, upload.single('image'), cmsController.createHowToPlayQuestion)
router.put('/howToPlay/:id', authenticateTokenCms, upload.single('image'), cmsController.updateHowToPlayQuestion)
router.delete('/howToPlay/:id', authenticateTokenCms, cmsController.deleteHowToPlayQuestion)

router.get('/termsAndConditions', authenticateTokenCms, cmsController.getTermsAndConditions)
router.get('/termsAndConditions/:id', authenticateTokenCms, cmsController.getTermsAndConditionsById)
router.post('/termsAndConditions', authenticateTokenCms, cmsController.createTermsAndConditions)
router.put('/termsAndConditions/:id', authenticateTokenCms, cmsController.updateTermsAndConditions)
router.delete('/termsAndConditions/:id', authenticateTokenCms, cmsController.deleteTermsAndConditions)

router.get('/rules', authenticateTokenCms, cmsController.getRules)
router.get('/rules/:id', authenticateTokenCms, cmsController.getRuleById)
router.post('/rules', authenticateTokenCms, cmsController.createRule)
router.put('/rules/:id', authenticateTokenCms, cmsController.updateRule)
router.delete('/rules/:id', authenticateTokenCms, cmsController.deleteRule)

router.get('/faq', authenticateTokenCms, cmsController.getFAQ)
router.get('/faq/:id', authenticateTokenCms, cmsController.getFAQId)
router.post('/faq', authenticateTokenCms, cmsController.createFAQ)
router.put('/faq/:id', authenticateTokenCms, cmsController.updateFAQ)
router.delete('/faq/:id', authenticateTokenCms, cmsController.deleteFAQ)

router.get('/message', authenticateTokenCms, cmsController.getMessages)
router.get('/message/:id', authenticateTokenCms, cmsController.getMessageById)
router.post('/message', authenticateTokenCms, cmsController.createMessage)
router.put('/message/:id', authenticateTokenCms, cmsController.updateMessage)
router.delete('/message/:id', authenticateTokenCms, cmsController.deleteMessage)
router.get('/player/message', authenticateTokenCms, cmsController.getMessageByClientId)

export default router
