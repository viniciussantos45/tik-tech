import { exec as execCallback } from 'child_process'
import fs from 'fs/promises'
import { promisify } from 'node:util'

import { parse, stringify } from 'ass-compiler'
import { PATH_RESULTS } from '../config/environment'

type Mark = {
  time: number
  type: string
  start: number
  end: number
  value: string
}

const exec = promisify(execCallback)

const getMarks = async (filePathMarks: string): Promise<Mark[]> => {
  const content = await fs.readFile(filePathMarks, 'utf8')

  const lines = content.split('\n').filter((line) => line.trim().length > 0)

  const marks = lines.map((line) => JSON.parse(line))

  return marks as Mark[]
}

// Função para converter milissegundos em formato SRT (HH:MM:SS,mmm)
function convertTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60)
  const seconds = totalSeconds - hours * 3600 - minutes * 60
  const milliseconds = ms % 1000

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`
}

// Função para adicionar zeros à esquerda
function pad(num: number, size = 2): string {
  return num.toString().padStart(size, '0')
}

// Função para criar legendas a partir de um array de marcas
function createCaptions(marks: Mark[], maxTimeDiff = 2000): string {
  let captions = ''
  let startTime = convertTime(marks[0].time)
  let words = [marks[0].value]
  let captionIndex = 1

  for (let i = 1; i < marks.length; i++) {
    const timeDiff = marks[i].time - marks[i - 1].time
    const tempSentence = [...words, marks[i].value].join(' ')

    // Limitar a quantidade de caracteres em uma legenda
    if (timeDiff <= maxTimeDiff && tempSentence.length < 64) {
      words.push(marks[i].value)
    } else {
      const nextStartTime = convertTime(marks[i].time) // hora de início da próxima palavra
      const endTime = marks[i - 1]
        ? convertTime(Math.min(marks[i - 1].time + 500, marks[i].time - 100))
        : convertTime(marks[i].time + 1000) // hora de término da palavra
      captions += `${captionIndex++}\n${startTime} --> ${endTime}\n${formatCaption(words.join(' '))}\n\n`

      startTime = nextStartTime
      words = [marks[i].value]
    }
  }

  const endTime = convertTime(marks[marks.length - 1].time + 1000) // adiciona 1 segundo ao final da última palavra
  captions += `${captionIndex}\n${startTime} --> ${endTime}\n${formatCaption(words.join(' '))}\n\n`

  return captions
}

// Função para formatar uma legenda para ter no máximo 32 caracteres por linha
function formatCaption(caption: string): string {
  if (caption.length <= 32) {
    return caption
  }

  let lineBreakIndex = caption.indexOf(' ', 32)
  if (lineBreakIndex === -1 || lineBreakIndex > 64) {
    lineBreakIndex = 32
  }

  return caption.slice(0, lineBreakIndex) + '\n' + caption.slice(lineBreakIndex + 1)
}

export async function styleFontAss(filePath: string) {
  // get content from filePath
  const content = await fs.readFile(filePath, 'utf8')

  const parsedASS = parse(content)

  parsedASS.styles.style[0].Fontsize = '15'
  parsedASS.styles.style[0].PrimaryColour = '&H00FFFF&'
  parsedASS.styles.style[0].Italic = '1'

  const newParsedAss = stringify(parsedASS)

  // console.log('decompiledText', decompiledText)

  await fs.writeFile(filePath, newParsedAss)
}

export const buildSubtitle = async (id: string) => {
  const filePathMarks = `${PATH_RESULTS}/${id}/subtitles.marks`

  const marks = await getMarks(filePathMarks)

  const captions = createCaptions(marks)

  await fs.writeFile(`${PATH_RESULTS}/${id}/captions.srt`, captions)

  const outputAss = `${PATH_RESULTS}/${id}/captions.ass`

  await exec(`ffmpeg -i ${PATH_RESULTS}/${id}/captions.srt ${outputAss}`)

  await styleFontAss(outputAss)

  return captions
}
