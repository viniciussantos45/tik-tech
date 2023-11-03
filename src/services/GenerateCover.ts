import axios, { AxiosResponse } from 'axios'
import Jimp from 'jimp'
import path from 'node:path'
import { IMAGE_GENERATOR_HOST, PATH_RESULTS } from '../config/environment'

type GenerateCover = {
  id: string
  title: string
  tags: string[]
  language: string
  username: string
}

export const generateCover = async (params: GenerateCover) => {
  const { id, ...dataParams } = params

  try {
    const response: AxiosResponse = await axios.get(`http://${IMAGE_GENERATOR_HOST}:2000/capture`, {
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
