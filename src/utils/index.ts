import { englishWords } from './englishWords'

const words = [...new Set(englishWords)]

type Params = {
  [key: string]: string | number | boolean | Array<string | number | boolean>
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
    str = str.replace(regex, `<lang xml:lang="${language}">${words[i]}</lang>`) // Substitui a palavra na string
  }
  return str
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
