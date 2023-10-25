import dotenv from 'dotenv'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'

import { buildSubtitle } from './src/services/BuildSubtitle'
import { buildVideo } from './src/services/BuildVideo'
import { generateAudio } from './src/services/GenerateAudio'
import { generateCarbonCode } from './src/services/GenerateCarbonCode'
import { generateContent } from './src/services/GenerateContent'
import { generateCover } from './src/services/GenerateCover'
import { generateSubtitle } from './src/services/GenerateSubtitles'
import { replaceWordsToSpeechLanguageSSML } from './src/utils'
import { SpeechBase } from './types'

dotenv.config()

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

async function videoGenerator(feature: string, programming_language: string) {
  const config: SpeechBase = {
    OutputS3BucketName: 'audio-generated',
    Engine: 'neural',
    LanguageCode: 'pt-BR',
    TextType: 'ssml',
    VoiceId: 'Thiago'
  }

  const id = uuid()
  const dir = `${PATH_RESULTS}/${id}`

  console.log(`Creating directory ${dir}`)
  await fs.mkdir(dir, { recursive: true })

  console.log('Generating content')
  const content = await generateContent({ feature, programming_language })

  if (!content) {
    throw new Error('Content not generated')
  }

  const textWithoutSSML = content.narration.replace(/(')|(`)/g, '')
  let text = `<speak><prosody rate="fast">${textWithoutSSML}</prosody></speak>`
  text = replaceWordsToSpeechLanguageSSML(text, 'en-US')

  console.log('Generating audio and subtitle')

  await Promise.all([generateAudio({ id, config, text }), generateSubtitle({ id, config, text })])

  console.log('Building subtitle')
  await buildSubtitle(id)

  console.log('Generating carbon code')
  await Promise.all([
    generateCarbonCode({ code: content.code_example, language: content.programming_language, id }),
    generateCover({
      id,
      title: content.title,
      tags: content.tags,
      language: content.programming_language,
      username: 'devnocomando'
    })
  ])

  await buildVideo(id)

  return {
    id,
    feature,
    programming_language
  }
}

async function main() {
  try {
    await videoGenerator('Sharp', 'nodejs')
  } catch (error) {
    console.error(error)
  }
}

main()
