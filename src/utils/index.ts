import { englishWords } from './englishWords'

const words = [...new Set(englishWords)]

type Params = {
  [key: string]: string | number | boolean | Array<string | number | boolean>
}

export interface Mark {
  time: number
  type: string
  start: number
  end: number
  value: string
}

export const formatParams = (params: Params) => {
  return (
    '?' +
    Object.entries(params)
      .map(([key, val]) => {
        if (Array.isArray(val)) {
          return `${key}=${JSON.stringify(val)}`
        }

        return `${key}=${encodeURIComponent(val)}`
      })
      .join('&')
  )
}

export function removeFirstWordInCodeBlocks(input: string): string {
  const blocks = input.split('```').filter((_, i) => i % 2 === 1)
  const results = blocks
    .map((block) => {
      const words = block.trim().split(/\s+/)
      words.shift()
      return words.join(' ')
    })
    .join(' ')
  return results
}

export function replaceWordsToSpeechLanguageSSML(str: string, language: string) {
  for (let i = 0; i < words.length; i++) {
    const regex = new RegExp('\\b' + words[i] + '\\b', 'gi') // Cria um novo objeto RegExp para cada palavra
    str = str.replace(regex, `<lang xml:lang="${language}">${words[i].toLowerCase()}</lang>`) // Substitui a palavra na string
  }
  return str
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function addPunctuation(text: string, marks: string[]): string[] {
  const words = text.match(/\b\w+[\\.,!?:;"'-]*\b/g) ?? []

  const newMarks = marks
    .filter((m) => m.trim() !== '')
    .map((markString) => {
      const mark = JSON.parse(markString) as Mark
      const start = mark.start
      const end = mark.end

      const phrase = text.substring(start, end)
      console.log(phrase)

      const word = words.find((word) => word.startsWith(mark.value))

      if (word) {
        mark.value = word // Atualiza a palavra na marca, incluindo pontuação
      }

      return JSON.stringify(mark)
    })

  return newMarks
}
