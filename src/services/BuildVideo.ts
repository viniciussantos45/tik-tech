import { exec as execCallback } from 'child_process'

import path from 'node:path'
import { promisify } from 'util'
import { getRandomInt } from '../utils'

const exec = promisify(execCallback)

const PATH_RESULTS = process.env.PATH_RESULTS ?? 'results'

const getMediaDuration = async (filePath: string) => {
  const { stdout } = await exec(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  )
  return parseFloat(stdout.trim())
}

export const buildVideo = async (id: string) => {
  const videoBase: string = path.resolve(__dirname, `../../videos/${getRandomInt(1, 14)}.mp4`)
  const audio: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/audio.mp3`)
  const imagem: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/code.png`)
  const legenda: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/captions.ass`)
  const cover: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/cover.png`)

  const outputFinalVideo: string = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/output_final_video.mp4`)

  const audioDuration = await getMediaDuration(audio)
  const videoBaseDuration = await getMediaDuration(videoBase)

  const loopsRequired = Math.ceil(audioDuration / videoBaseDuration)

  const loopedVideoPath = path.resolve(process.cwd(), `${PATH_RESULTS}/${id}/looped_video.mp4`)

  const loopCommand = `
    ffmpeg -y
    -stream_loop ${loopsRequired - 1}
    -i "${videoBase}"
    -c copy
    ${loopedVideoPath}
  `.replace(/(\n)/g, '')

  await exec(loopCommand)

  const complexFilter = `
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,trim=0:${audioDuration}[tocover];
    [tocover]boxblur=5:5[blurred];
    [blurred][3:v]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,0,1)'[coverOverlay];
    [coverOverlay][2:v]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='gte(t,1.1)'[vidWithImage];
    [vidWithImage]ass='${legenda.replace(/\\/g, '\\\\').replace(':', '\\:')}',setpts=PTS+2/TB[outv];
    [1:a]adelay=2000|2000,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,aresample=async=1:first_pts=0[finalAudio]
`.replace(/(\n)/g, '')

  const command = `
    ffmpeg -y
    -i "${loopedVideoPath}"
    -i "${audio}"
    -i "${imagem}"
    -i "${cover}"
    -filter_complex "${complexFilter.trim()}"
    -map "[outv]"
    -map "[finalAudio]"
    -vcodec libx264
    -preset ultrafast
    -acodec aac
    ${outputFinalVideo}
`.replace(/(\n)/g, '')

  await exec(command)
}
