import { Response } from 'express'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Admin } from '../models/admin'
import { StaticPageCMS, Message, HowToPlay, Rules, TermsAndConditions, FAQ } from '../config/index'
import { adminLogs } from '../shared/utils'

const controller = {
  getStaticPageCMSByGameType: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with id ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const existingData = await StaticPageCMS.findOne({ where: { admin_id: admin.id } })
      const gameData = existingData?.get({ plain: true })

      return res.status(200).send({ success: true, data: { gameData } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  updateStaticPageCMSOrCreateNew: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { type, text } = req.body
      // if (!req.file) {
      //   return res.status(400).send('No file uploaded.')
      // }

      if (!type || type == '') {
        return res.status(400).json({ error: 'type is required' })
      }

      if (!text || text == '') {
        return res.status(400).json({ error: 'text is required' })
      }

      const filePath = req.file ? req.file.path : null

      const username = req.user?.username
      let data
      switch (type) {
        case 'howToPlay':
          data = {
            howtoplay_text: text,
            howtoplay_image: filePath,
          }
          break
        case 'about':
          data = {
            about_text: text,
            about_image: filePath,
          }
          break
        case 'rules':
          data = {
            rules_text: text,
            rules_image: filePath,
          }
          break
        case 't&c':
          data = {
            tc_text: text,
            tc_image: filePath,
          }
          break
        default:
          return res
            .status(400)
            .json({ success: false, message: `${type} must be one of this howToPlay, about, rules or t&c` })
      }

      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const existingData = await StaticPageCMS.findOne({ where: { admin_id: admin.id } })
      if (existingData) {
        if (data) {
          await existingData.update(data)
        }
      } else {
        await StaticPageCMS.create({ ...data, admin_id: admin.id })
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Update StaticPageCMS ${type}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res
        .status(201)
        .send({ success: true, data: { data }, message: `record ${existingData ? 'updated' : 'created'} successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getMessageByClientId: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const clientId = req.user?.organization_id
      if (!clientId) {
        throw new Error('Distributor ID not found in token')
      }

      const messages = await Message.findAll({
        where: {
          client_id: clientId,
          status: 'Active',
        },
        attributes: ['id', 'message_name', 'message_body'],
        order: [['created_at', 'DESC']],
      })

      return res.status(200).send({
        success: true,
        data: messages,
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  getMessages: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { limit, offset } = req.query
      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with id ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0
      const totalCount = await Message.count({ where: { created_by: admin.id } })
      const messages = await Message.findAll({
        where: { created_by: admin.id },
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Admin,
            attributes: ['username'],
            as: 'admin',
          },
        ],
        order: [['updated_at', 'DESC']],
      })
      return res.status(200).send({ success: true, data: { messages }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getMessageById: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const message = await Message.findByPk(id)

      if (!message) {
        throw new Error(`Message with id ${id} not found`)
      }

      return res.status(200).send({ success: true, data: message.get({ plain: true }) })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createMessage: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { message_name: messageName, message_body: messageBody, status, client_id: clientId } = req.body
      if (!messageName || messageName == '') {
        return res.status(400).json({ error: 'message_name is required' })
      }

      if (!messageBody || messageBody == '') {
        return res.status(400).json({ error: 'message_body is required' })
      }

      if (!clientId || clientId == '') {
        return res.status(400).json({ error: 'client_id is required' })
      }

      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ error: 'status must be Active or Inactive' })
      }

      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const data = {
        message_name: messageName,
        message_body: messageBody,
        status,
        client_id: clientId,
        created_by: admin.id,
      }
      await Message.create(data)
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Created Message`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'Message created successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateMessage: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { message_name: messageName, message_body: messageBody, status, client_id: clientId } = req.body
      const { id } = req.params
      const username = req.user?.username
      const existMessage = await Message.findByPk(id)
      if (!existMessage) {
        return res.status(400).json({ success: false, message: `Message doesn't exists with id ${id}` })
      }

      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      // const admin = adminExists.get({ plain: true })
      const data: any = {}
      if (messageName && messageName !== '') {
        data.message_name = messageName
      }

      if (messageBody && messageBody !== '') {
        data.message_body = messageBody
      }

      if (clientId && clientId !== '') {
        data.client_id = clientId
      }

      if (status && status !== '') {
        if (!['Active', 'Inactive'].includes(status)) {
          return res.status(400).json({ error: 'status must be Active or Inactive' })
        }

        data.status = status
      }

      if (data) {
        await existMessage.update(data)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Updated Message ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'Message updated successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteMessage: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const deleted = await Message.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`Message with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Deleted Message ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: `Message with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getHowToPlayQuestions: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { limit, offset } = req.query
      // const username = req.user?.username
      // const adminExists = await Admin.findOne({ where: { username: username } })
      // if (!adminExists) {
      //   throw new Error(`Admin with id ${username} does not exist.`)
      // }

      // const admin = adminExists.get({ plain: true })
      const whereFilter: any = {}
      // whereFilter.created_by = admin.id

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const totalCount = await HowToPlay.count({ where: whereFilter })

      const questions = await HowToPlay.findAll({
        where: whereFilter,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Admin,
            attributes: ['username'],
            as: 'admin',
          },
        ],
      })
      return res.status(200).send({ success: true, data: { response: questions }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getHowToPlayQuestionById: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const howToPlay = await HowToPlay.findByPk(id)

      if (!howToPlay) {
        throw new Error(`Question with id ${id} not found`)
      }

      return res.status(200).send({ success: true, data: howToPlay.get({ plain: true }) })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createHowToPlayQuestion: async (req: any, res: Response): Promise<void | Response> => {
    try {
      const { question, answer } = req.body

      // if (!req.file) {
      //   return res.status(400).json({ success: false, error: 'No file uploaded.' })
      // }

      if (!question || question == '') {
        return res.status(400).json({ success: false, error: 'question is required' })
      }

      if (!answer || answer == '') {
        return res.status(400).json({ success: false, error: 'answer is required' })
      }

      const filePath = req.file ? req.file.location : null
      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const data = {
        question: question,
        answer: answer,
        image_url: filePath,
        created_by: admin.id,
      }
      await HowToPlay.create(data)
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Created How To Play`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'How To Play Question created successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateHowToPlayQuestion: async (req: any, res: Response): Promise<void | Response> => {
    try {
      const { question, answer } = req.body
      const { id } = req.params
      const username = req.user?.username
      const existQuestion = await HowToPlay.findByPk(id)
      if (!existQuestion) {
        return res.status(400).json({ success: false, message: `Question doesn't exists with id ${id}` })
      }

      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      // const admin = adminExists.get({ plain: true })
      const data: any = {}

      if (req.file) {
        const filePath = req.file ? req.file.location : null
        data.image_url = filePath
      }

      if (question && question !== '') {
        data.question = question
      }

      if (answer && answer !== '') {
        data.answer = answer
      }

      if (data) {
        await existQuestion.update(data)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Updated How To Play ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'Question updated successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteHowToPlayQuestion: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const deleted = await HowToPlay.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`Question with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Deleted How To Play ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: `Question with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getRules: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { limit, offset } = req.query
      // const username = req.user?.username
      // let adminExists;
      const whereFilter: any = {}
      // if(username){
      //   adminExists = await Admin.findOne({ where: { username: username } })
      //   if (!adminExists) {
      //     throw new Error(`Admin with id ${username} does not exist.`)
      //   }

      //   const admin = adminExists.get({ plain: true })
      //   whereFilter.created_by = admin.id
      // }

      const totalCount = await Rules.count({ where: whereFilter })

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const rules = await Rules.findAll({
        where: whereFilter,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Admin,
            attributes: ['username'],
            as: 'admin',
          },
        ],
        order: [['updated_at', 'DESC']],
      })
      return res.status(200).send({ success: true, data: { rules }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getRuleById: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const rule = await Rules.findByPk(id)

      if (!rule) {
        throw new Error(`Rule with id ${id} not found`)
      }

      return res.status(200).send({ success: true, data: rule.get({ plain: true }) })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createRule: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { rule_name: ruleName, rules } = req.body

      if (!ruleName || ruleName == '') {
        return res.status(400).json({ error: 'rule_name is required' })
      }

      if (!rules || rules == '') {
        return res.status(400).json({ error: 'rules is required' })
      }

      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const data = {
        rule_name: ruleName,
        rules: rules,
        created_by: admin.id,
      }
      await Rules.create(data)
      return res.status(201).send({ success: true, message: 'rule created successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          'Created a Rule',
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateRule: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { rule_name: ruleName, rules } = req.body
      const { id } = req.params
      const username = req.user?.username
      const existRule = await Rules.findByPk(id)
      if (!existRule) {
        return res.status(400).json({ success: false, message: `rule doesn't exists with id ${id}` })
      }

      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      // const admin = adminExists.get({ plain: true })
      const data: any = {}

      if (ruleName && ruleName !== '') {
        data.rule_name = ruleName
      }

      if (rules && rules !== '') {
        data.rules = rules
      }

      if (data) {
        await existRule.update(data)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Updated Rule ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'Rule updated successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteRule: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const deleted = await Rules.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`Rule with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Deleted Rule ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: `Rule with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getTermsAndConditions: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { limit, offset } = req.query
      // const username = req.user?.username
      // const adminExists = await Admin.findOne({ where: { username: username } })
      // if (!adminExists) {
      //   throw new Error(`Admin with id ${username} does not exist.`)
      // }

      // const admin = adminExists.get({ plain: true })
      const whereFilter: any = {}
      // whereFilter.created_by = admin.id

      const totalCount = await TermsAndConditions.count({ where: whereFilter })

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const terms = await TermsAndConditions.findAll({
        where: whereFilter,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Admin,
            attributes: ['username'],
            as: 'admin',
          },
        ],
        order: [['updated_at', 'DESC']],
      })
      return res.status(200).send({ success: true, data: { terms }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getTermsAndConditionsById: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const terms = await TermsAndConditions.findByPk(id)

      if (!terms) {
        throw new Error(`terms with id ${id} not found`)
      }

      return res.status(200).send({ success: true, data: terms.get({ plain: true }) })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createTermsAndConditions: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { terms } = req.body

      if (!terms || terms == '') {
        return res.status(400).json({ error: 'terms is required' })
      }

      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const data = {
        terms: terms,
        created_by: admin.id,
      }
      await TermsAndConditions.create(data)
      // Logging action for master_admin
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Created Terms and Conditions`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'terms created successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateTermsAndConditions: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { terms } = req.body
      const { id } = req.params
      const username = req.user?.username
      const existTerm = await TermsAndConditions.findByPk(id)
      if (!existTerm) {
        return res.status(400).json({ success: false, message: `terms doesn't exists with id ${id}` })
      }

      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const data: any = {}

      if (terms && terms !== '') {
        data.terms = terms
      }

      if (data) {
        await existTerm.update(data)
      }

      // Logging action for master_admin
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Updated Terms and Conditions ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'terms updated successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteTermsAndConditions: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const deleted = await TermsAndConditions.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`terms with id ${id} not found`)
      }

      // Logging action for master_admin
      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Deleted Terms and Conditions ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: `terms with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  getFAQ: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { limit, offset } = req.query
      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const faq = await FAQ.findAndCountAll({
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Admin,
            attributes: ['username'],
            as: 'admin',
          },
        ],
      })
      return res.status(200).send({ success: true, data: faq.rows, count: faq.count })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getFAQId: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const faq = await FAQ.findByPk(id)

      if (!faq) {
        throw new Error(`FAQ with id ${id} not found`)
      }

      return res.status(200).send({ success: true, data: faq.get({ plain: true }) })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createFAQ: async (req: any, res: Response): Promise<void | Response> => {
    try {
      const { question, answer } = req.body

      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'master_admin')) {
        return res.status(400).json({ success: false, message: 'You are not authorized to delete FAQ' })
      }

      if (!question || question == '') {
        return res.status(400).json({ error: 'question is required' })
      }

      if (!answer || answer == '') {
        return res.status(400).json({ error: 'answer is required' })
      }

      const username = req.user?.username
      const adminExists = await Admin.findOne({ where: { username: username } })
      if (!adminExists) {
        throw new Error(`Admin with username ${username} does not exist.`)
      }

      const admin = adminExists.get({ plain: true })
      const data = {
        question: question,
        answer: answer,
        created_by: admin.id,
      }
      await FAQ.create(data)

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Create FAQ ${question}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(201).send({ success: true, message: 'FAQ created successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateFAQ: async (req: any, res: Response): Promise<void | Response> => {
    try {
      const { question, answer } = req.body
      const { id } = req.params
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'master_admin')) {
        return res.status(400).json({ success: false, message: 'You are not authorized to delete FAQ' })
      }

      const data: any = {}

      if (question && question !== '') {
        data.question = question
      }

      if (answer && answer !== '') {
        data.answer = answer
      }

      if (!data) {
        return res.status(400).json({ success: false, message: 'No data to update' })
      }

      const [updatedCount] = await FAQ.update(data, { where: { id } })
      if (updatedCount === 0) {
        return res.status(400).send({ success: false, message: `FAQ doesn't exists with id ${id}` })
      }

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Update FAQ ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: 'FAQ updated successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteFAQ: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'master_admin')) {
        return res.status(400).json({ success: false, message: 'You are not authorized to delete FAQ' })
      }

      const deleted = await FAQ.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`FAQ with id ${id} not found`)
      }

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Delete FAQ ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      return res.status(200).send({ success: true, message: `FAQ with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
}

export default controller
