import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import Jimp from 'jimp'
import path from 'node:path'

dotenv.config()

import { CARBONARA_HOST, PATH_RESULTS } from '../config/environment'

type GenerateCarbonCodeParams = {
  code: string
  language: (typeof languagePrograms)[keyof typeof languagePrograms]
  id: string
}

export const languagePrograms = {
  nodejs: 'javascript',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  csharp: 'csharp',
  php: 'php',
  ruby: 'ruby',
  go: 'go',
  kotlin: 'kotlin',
  swift: 'swift',
  rust: 'rust',
  c: 'c',
  cpp: 'cpp',
  dart: 'dart',
  r: 'r',
  scala: 'scala'
} as const

export async function generateCarbonCode({ code, language, id }: GenerateCarbonCodeParams) {
  const data = {
    code: `${code}`,
    backgroundColor: 'rgba(74,144,226,0)',
    theme: 'dracula-pro',
    // theme: 'base16-dark',
    windowTheme: 'none',
    language: languagePrograms[language] ?? 'auto',
    dropShadow: true,
    dropShadowOffsetY: '10px',
    dropShadowBlurRadius: '28px',
    windowControls: true,
    widthAdjustment: false,
    width: 520,
    lineNumbers: false,
    firstLineNumber: 1,
    fontSize: '15px',
    fontFamily: 'Fira Code',
    lineHeight: '133%',
    squaredImage: false,
    watermark: false,
    exportSize: '2x',
    paddingVertical: '40px',
    paddingHorizontal: '40px',
    prettify: true
  }

  try {
    const response: AxiosResponse = await axios.post(`http://${CARBONARA_HOST}:3000/api/cook`, data, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer'
    })

    if (response.status != 200) {
      throw new Error('API call failed')
    }

    const img: Jimp = await Jimp.read(Buffer.from(response.data))

    // Salve a imagem como PNG
    img.write(path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/code.png`))
  } catch (error) {
    console.error(error)
  }
}
