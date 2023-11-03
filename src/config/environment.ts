import dotenv from 'dotenv'

dotenv.config()

export const AWS_CREDENTIALS = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
}

export const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

export const IMAGE_GENERATOR_HOST = process.env.IMAGE_GENERATOR_HOST ?? 'localhost'

export const CARBONARA_HOST = process.env.CARBONARA_HOST ?? 'localhost'

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
