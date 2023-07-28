import { exec as execCallback } from 'child_process'

import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'util'
import { getRandomInt } from '../utils'

const exec = promisify(execCallback)

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

export const buildVideo = async (id: string) => {
  // const videoBase: string = path.resolve(__dirname, `../../videos/${getRandomInt(1, 14)}.mp4`)
  const videoBase: string = path.resolve(__dirname, `../../videos/${getRandomInt(1, 14)}.mp4`)
  const audio: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/audio.mp3`)
  const imagem: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/code.png`)
  const legenda: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/captions.ass`) // problema de caminho absoluto
  const cover: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/cover.png`)

  const outputBaseImage: string = path.resolve(__dirname, '../../results/base.jpg')
  const outputSegment: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_segment.mp4`)

  const intermediateVideoCover: string = path.resolve(__dirname, '../../results/intermediate_cover.ts')
  const outputVideoCoverNonAudio: string = path.resolve(__dirname, '../../results/output_cover_non_audio.mp4')
  const outputVideoCover: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_cover.mp4`)

  const outputWithAudio: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_with_audio.mp4`)
  const outputWithImageCode: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_with_image.mp4`)
  const outputWithBlur: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_with_blur.mp4`)
  const outputResized: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_resized.mp4`)
  const outputPrincipalVideo: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_principal_video.mp4`)

  const intermediateFinalVideo: string = path.resolve(__dirname, '../../results/intermediate_final.ts')
  const outputFinalVideo: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_final_video.mp4`)

  const commands = [
    // Make cover
    `ffmpeg -y -i ${videoBase} -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -t 2 ${outputSegment}`,
    `ffmpeg -y -i ${outputSegment} -i ${cover} -filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" ${outputVideoCover}`,
    // Make principal video
    `ffmpeg -y -i ${videoBase} -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ${outputResized}`,
    `ffmpeg -y -i ${outputResized} -vf "boxblur=5:5" ${outputWithBlur}`,
    `ffmpeg -y -stream_loop -1 -i ${outputWithBlur} -i ${audio} -shortest -map 0:v:0 -map 1:a:0 ${outputWithAudio}`,
    // `ffmpeg -y -stream_loop -1 -i ${outputResized} -i ${audio} -shortest -map 0:v:0 -map 1:a:0 ${outputWithAudio}`,
    // `ffmpeg -i captions.srt output.ass`,

    // `ffmpeg -y -i ${outputWithAudio} -i ${imagem} -filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,5,15)'" ${outputWithImageCode}`,
    `ffmpeg -y -i ${outputWithAudio} -i ${imagem} -filter_complex "[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" ${outputWithImageCode}`,

    `ffmpeg -y -i ${outputWithImageCode} -vf "ass='${legenda
      .replace(/\\/g, '\\\\')
      .replace(':', '\\:')}'" ${outputPrincipalVideo}`,

    // generate intermediate
    // `ffmpeg -i ${outputVideoCover} -c copy ${intermediateVideoCover}`,
    // `ffmpeg -i ${outputPrincipalVideo} -c copy ${intermediateFinalVideo}`,

    // // Make final video
    // `ffmpeg -i "concat:${intermediateVideoCover}|${intermediateFinalVideo}" -c copy ${outputFinalVideo}`

    `ffmpeg -i ${outputVideoCover} -i ${outputPrincipalVideo} -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -vcodec libx264 -acodec aac ${outputFinalVideo}`
  ]

  for (const command of commands) {
    console.log(`execute command: `, command)
    await exec(command)
  }

  await fs.unlink(outputSegment)
  await fs.unlink(outputVideoCover)
  await fs.unlink(outputWithAudio)
  await fs.unlink(outputWithImageCode)
  await fs.unlink(outputWithBlur)
  await fs.unlink(outputResized)
  await fs.unlink(outputPrincipalVideo)
}
