import dotenv from 'dotenv'
import fs from 'fs/promises'

import { SpeechBase } from '../../types'
import { getIO } from '../socket'
import { replaceWordsToSpeechLanguageSSML } from '../utils'
import { buildSubtitle } from './BuildSubtitle'
import { buildVideo } from './BuildVideo'
import { generateAudio } from './GenerateAudio'
import { generateCarbonCode } from './GenerateCarbonCode'
import { generateContent } from './GenerateContent'
import { generateCover } from './GenerateCover'
import { generateSubtitle } from './GenerateSubtitles'

dotenv.config()

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

export async function videoGenerator(feature: string, programming_language: string, id: string) {
  const io = getIO()

  const config: SpeechBase = {
    OutputS3BucketName: 'audio-generated',
    Engine: 'neural',
    LanguageCode: 'pt-BR',
    TextType: 'ssml',
    VoiceId: 'Thiago'
  }

  const dir = `${PATH_RESULTS}/${id}`

  console.log(`Creating directory ${dir}`)
  await fs.mkdir(dir, { recursive: true })

  console.log('Generating content')
  io.emit('video-status', { id, status: 'processing', status_message: 'Generating content' })

  const content = await generateContent({ feature, programming_language })

  if (!content) {
    io.emit('video-status', { id, status: 'error', status_message: 'Content not generated' })
    throw new Error('Content not generated')
  }

  const textWithoutSSML = content.narration.replace(/(')|(`)/g, '')
  let text = `<speak><prosody rate="fast">${textWithoutSSML}</prosody></speak>`
  text = replaceWordsToSpeechLanguageSSML(text, 'en-US')

  console.log('Generating audio and subtitle')
  io.emit('video-status', { id, status: 'processing', status_message: 'Generating audio and subtitle' })

  await Promise.all([generateAudio({ id, config, text }), generateSubtitle({ id, config, text })])

  console.log('Building subtitle')
  io.emit('video-status', { id, status: 'processing', status_message: 'Building subtitle' })

  await buildSubtitle(id)

  console.log('Generating carbon code')
  io.emit('video-status', { id, status: 'processing', status_message: 'Generating code' })

  await Promise.all([
    generateCarbonCode({ code: content.code_example, language: content.programming_language, id }),
    generateCover({
      id,
      title: content.title,
      tags: content.tags,
      language: content.programming_language,
      username: 'vinicius.gomes'
    })
  ])

  io.emit('video-status', { id, status: 'processing', status_message: 'Join all parts for this video' })
  await buildVideo(id)

  io.emit('video-status', { id, status: 'finished', status_message: 'Your video was generated' })
  return {
    id,
    feature,
    programming_language
  }
}
