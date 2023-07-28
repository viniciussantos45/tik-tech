import axios, { AxiosResponse } from 'axios'
import Jimp from 'jimp'
import path from 'node:path'

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

type GenerateCarbonCodeParams = {
  code: string
  id: string
}

export async function generateCarbonCode({ code, id }: GenerateCarbonCodeParams) {
  const data = {
    code: `${code}`,
    backgroundColor: 'rgba(74,144,226,0)',
    theme: 'dracula-pro',
    // theme: 'base16-dark',
    windowTheme: 'none',
    language: 'javascript',
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
    const response: AxiosResponse = await axios.post('http://localhost:3000/api/cook', data, {
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
