import axios, { AxiosResponse } from 'axios'
import Jimp from 'jimp'
import path from 'node:path'

type GenerateCover = {
  id: string
  title: string
  tags: string[]
  language: string
  username: string
}

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

export const generateCover = async (params: GenerateCover) => {
  const { id, ...dataParams } = params

  try {
    const response: AxiosResponse = await axios.get('http://localhost:2000/capture', {
      headers: { 'Content-Type': 'application/json' },
      params: dataParams,
      responseType: 'arraybuffer'
    })

    if (response.status != 200) {
      throw new Error('API call failed')
    }

    const img: Jimp = await Jimp.read(Buffer.from(response.data))

    // Salve a imagem como PNG
    img.write(path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/cover.png`))
  } catch (error) {
    console.error(error)
  }
}
