import dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'
import { removeFirstWordInCodeBlocks } from '../utils'
import { languagePrograms } from './GenerateCarbonCode'

dotenv.config()

type GenerateContentReturn = {
  title: string
  tags: string[]
  programming_language: (typeof languagePrograms)[keyof typeof languagePrograms]
  code_example: string
  narration: string
}

type GenerateContentParams = {
  feature: string
  programming_language: string
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function generateContent({ feature, programming_language }: GenerateContentParams) {
  try {
    const chatCompletion = await openai.createChatCompletion({
      // model: 'gpt-3.5-turbo-16k',
      model: 'gpt-3.5-turbo-0613',
      // model: 'gpt-4-0613',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant trained to provide advice on software development.`
        },
        {
          role: 'user',
          content: `Explain the use of ${feature} in ${programming_language}, what it is for, give examples of use and explain details of the example code. Return all answer in portuguese. Be polite, as this is for a social media video, at the end of the narration ask to follow for more tips and to leave a comment`
        }
      ],
      functions: [
        {
          name: 'generateContentForVideo',
          description: 'Generate content for video in portuguese',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'title of feature or lib to be explained. Only one word'
              },
              tags: {
                type: 'array',
                description:
                  'tags with the benefits of using this feature or lib. Each tag is only one word  should not be is a programming language',
                items: {
                  type: 'string'
                }
              },
              programming_language: {
                type: 'string',
                description:
                  'programming language based in answer, or technologies for ex: nodejs, python, typescript ,reactjs, reactnative, javascript, python, java, etc'
              },
              code_example: {
                type: 'string',
                description: 'code example based in example. Should be in markdown. Do not add comments'
              },
              narration: {
                type: 'string',
                description:
                  'Text for tip narration in video. give examples of use. Do not add example code. Welcome and explain like a teacher'
              }
            }
          }
        }
      ],
      function_call: {
        name: 'generateContentForVideo'
      },

      temperature: 0.1
    })

    const args = JSON.parse(chatCompletion.data.choices[0].message?.function_call?.arguments ?? '')

    args.narration = args.narration.replace(/```[\s\S]*?```/g, '')

    if (args.code_example[0] === '`') {
      args.code_example = removeFirstWordInCodeBlocks(args.code_example)
    }

    args.programming_language = programming_language.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

    return args as GenerateContentReturn
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const errorResponse = error as { response: { data: { error: { message: string } } } }

      console.error(errorResponse.response.data.error.message)
    } else {
      console.error(error)
    }
  }
}
