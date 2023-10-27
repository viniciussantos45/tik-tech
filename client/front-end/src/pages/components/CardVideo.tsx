import { VideoProps } from '@/types/Video'
import { Download, Video as VideoIcon } from '@phosphor-icons/react'

import JsFileDownloader from 'js-file-downloader'

type CardVideoProps = {
  videoData: VideoProps
}

export const CardVideo = ({ videoData }: CardVideoProps) => {
  const video = videoData

  const statusColor = video.status === 'pending' || video.status === 'processing' ? 'text-yellow-400' : 'text-green-500'
  const borderColor = video.status === 'pending' || video.status === 'processing' ? 'border-yellow-400' : 'border-green-500'

  return (
    <div
      key={video.uuid}
      className={`flex gap-3 border-2 ${statusColor} ${borderColor} rounded-2xl w-full px-5 py-3 items-center`}
    >
      <div>
        <VideoIcon weight='fill' size={26} />
      </div>
      <div className='flex items-center justify-between w-full'>
        <div>
          <div className={`flex gap-2 `}>
            <span className=' font-bold capitalize'>{video.feature}</span>•
            <span className=' capitalize'>{video.programming_language}</span>
          </div>
          <span>{video.status_message}</span>
        </div>
        {video.status === 'finished' && (
          <div
            className='cursor-pointer'
            onClick={() => {
              new JsFileDownloader({
                url: `http://localhost:10000/download/${video.uuid}`,
                filename: `${video.uuid}.mp4`,
                autoStart: true
              }).then(() => console.log('File downloaded'))
            }}
          >
            <Download size={32} weight='fill' />
          </div>
        )}
      </div>
    </div>
  )
}
