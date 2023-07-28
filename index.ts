import { v4 as uuid } from 'uuid'
import { generateContent } from './src/services/GenerateContent'
import { SpeechBase } from './types'

import dotenv from 'dotenv'
import fs from 'fs/promises'
import { buildSubtitle } from './src/services/BuildSubtitle'
import { buildVideo } from './src/services/BuildVideo'
import { generateAudio } from './src/services/GenerateAudio'
import { generateCarbonCode } from './src/services/GenerateCarbonCode'
import { generateCover } from './src/services/GenerateCover'
import { generateSubtitle } from './src/services/GenerateSubtitles'
import { replaceWordsToSpeechLanguageSSML } from './src/utils'

dotenv.config()

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

async function main() {
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
  const content = await generateContent({ feature: 'Knex', programming_language: 'nodejs' })

  if (!content) {
    throw new Error('Content not generated')
  }

  let text = `<speak><prosody rate="fast">${content.narration.replace(/'/g, '')}</prosody></speak>`
  text = replaceWordsToSpeechLanguageSSML(text, 'en-US')

  console.log('Generating audio and subtitle')

  await Promise.all([generateAudio({ id, config, text }), generateSubtitle({ id, config, text })])

  console.log('Building subtitle')
  await buildSubtitle(id)

  console.log('Generating carbon code')
  await Promise.all([
    generateCarbonCode({ code: content.code_example, id }),
    generateCover({
      id,
      title: content.title,
      tags: content.tags,
      language: content.programming_language,
      username: 'devnocomando'
    })
  ])

  await buildVideo(id)
}

main()
