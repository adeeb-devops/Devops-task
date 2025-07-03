import axios from 'axios'
import { logger } from './logger'
import { getEnv } from './env'

const env = getEnv()

export const postRequest = async (url: string, data: any | any[], token?: string): Promise<any> => {
  try {
    logger.info(`POST request to ${url} called with data: ${JSON.stringify(data)}`)

    const headers: any = { 'Content-Type': 'application/json', token: env.authenticationToken }
    if (token) headers.Authorization = token
    const response = await axios.post(url, data, {
      headers,
    })

    logger.info(`Response of POST ${url} is : ${JSON.stringify(response?.data)}`)

    return response?.data?.data
  } catch (error: any) {
    logger.error(`POST request to ${url} failed: ${error?.response?.data?.message}`)
    return null
  }
}

export const putRequest = async (url: string, data: any | any[], token?: string): Promise<any> => {
  try {
    logger.info(`Put request to ${url} called with data: ${JSON.stringify(data)}`)

    const headers: any = { 'Content-Type': 'application/json', token: env.authenticationToken }
    if (token) headers.Authorization = token
    const response = await axios.put(url, data, {
      headers,
    })

    logger.info(`Response of POST ${url} is : ${JSON.stringify(response?.data)}`)

    return response?.data?.data
  } catch (error: any) {
    logger.error(`POST request to ${url} failed: ${error?.response?.data?.message}`)
    return null
  }
}

export const getRequest = async (url: string): Promise<any> => {
  try {
    logger.info(`GET request to ${url} called with data`)
    const headers: any = { 'Content-Type': 'application/json', token: env.authenticationToken }
    const response = await axios.get(url, {
      headers,
    })

    logger.info(`Response of get ${url} is : ${JSON.stringify(response?.data)}`)

    return response?.data
  } catch (error: any) {
    logger.error(`GET request to ${url} failed: ${error?.response?.data?.message}`)
    return null
  }
}

export const getPlatformPlayerBalance = async (playerName: string): Promise<any> => {
  const url = `${env.qcBackendUrl}/player/lobby/balance`
  try {
    logger.info(`GET request to ${url} called with data`)
    const headers = { 'Content-Type': 'application/json', token: env.authenticationToken }
    const response = await axios.get(url, {
      headers,
      params: { player_name: playerName },
    })
    return response?.data?.data
  } catch (error: any) {
    logger.error(`GET request to ${url} failed: ${error?.response?.data?.message}`)
    throw new Error(`Failed to get player balance: ${playerName}`)
  }
}

export const getMaintenanceStatus = async (): Promise<any> => {
  const url = `${env.qcBackendUrl}/maintenance`
  try {
    logger.info(`GET request to ${url}`)
    const headers = { 'Content-Type': 'application/json', token: env.authenticationToken }
    const response = await axios.get(url, {
      headers,
      params: { game: 'Mines' },
    })
    return response?.data?.data
  } catch (error: any) {
    logger.error(`GET request to ${url} failed: ${error?.response?.data?.message}`)
    throw new Error(`Failed to get Maintenance status from QG Backend`)
  }
}

export const updatePlatformPlayerBalance = async (data: any): Promise<any> => {
  const url = `${env.qcBackendUrl}/player/balance`
  try {
    logger.info(`PATCH request to ${url}`)
    const headers = { 'Content-Type': 'application/json', token: env.authenticationToken }
    const response = await axios.patch(url, data, {
      headers,
    })
    return response?.data?.data
  } catch (error: any) {
    logger.error(`GET request to ${url} failed: ${error?.response?.data?.message}`)
    return null
    // throw new Error(`Failed to get Maintenance status from QG Backend`)
  }
}
