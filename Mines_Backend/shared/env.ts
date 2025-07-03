const defaultEnv = {
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
  databasePort: process.env.POSTGRES_PORT,
  databaseUrl: process.env.POSTGRES_URL,
  redisUrl: process.env.REDIS_URL,
  databaseUser: process.env.POSTGRES_USER,
  databaseName: process.env.POSTGRES_DB,
  databasePassword: process.env.POSTGRES_PASSWORD,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtExpiryTime: process.env.JWT_TOKEN_EXPIRY_TIME,
  qcBackendUrl: process.env.QC_BACKEND_URL,
  authenticationToken: process.env.AUTHENTICATION_TOKEN,
  lokiHost: process.env.LOKI_HOST,
  lokiAppName: process.env.LOKI_APP_NAME,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccesskey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  awsBucketName: process.env.S3_BUCKET_NAME,
}

const sanitizedEnv: Record<string, string> = {}

export const loadEnv = () => {
  type Keys = keyof typeof defaultEnv

  Object.keys(defaultEnv).forEach((item: string) => {
    if (!defaultEnv[item as Keys]) throw new Error(`${item} env is not defined`)
    sanitizedEnv[item] = defaultEnv[item as Keys] as string
  })

  return defaultEnv
}

export const getEnv = () => sanitizedEnv
