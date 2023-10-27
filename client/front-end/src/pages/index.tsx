import { FileVideo } from '@phosphor-icons/react'

import { socket } from '@/socket'
import { VideoProps } from '@/types/Video'
import { useEffect, useState } from 'react'
import { useIndexedDB } from 'react-indexed-db-hook'
import { CardVideo } from './components/CardVideo'
import { FormComponent } from './components/Form'

type PayloadVideoStatus = {
  id: string
  status: string
  status_message: string
}

function Home() {
  const { add, getAll, update } = useIndexedDB('videos')
  const [videos, setVideos] = useState<VideoProps[]>([])

  async function onSubmit(data: VideoProps) {
    await add(data)

    setVideos((prev) => [...prev, data])
  }

  async function loadVideos() {
    const videos = await getAll()

    setVideos(videos)

    return videos
  }

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    function onConnect() {
      console.log('Socket connected')
    }

    function onDisconnect() {
      console.log('Socket disconnected')
    }

    async function onVideoStatusEvent({ id: uuid, status, status_message }: PayloadVideoStatus) {
      const video = (await getAll()).find((video) => video.uuid === uuid)

      await update({ ...video, uuid, status, status_message })

      await loadVideos()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('video-status', onVideoStatusEvent)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('video-status', onVideoStatusEvent)
    }
  }, [])

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-5 px-20'>
      <div className='flex items-center text-primary mb-10'>
        <FileVideo size={64} weight='fill' />
        <h1 className='text-primary text-3xl font-bold tracking-wider'>Tik Tech</h1>
      </div>
      <FormComponent onSubmit={onSubmit} />

      <div className='flex flex-col gap-2 w-[60%]'>
        {videos.length > 0 && (
          <>
            <p className='text-gray-600 text-md font-bold mt-10'>Your Videos:</p>
            <div className='flex flex-col gap-2 max-h-[320px] overflow-auto pr-[1px]'>
              {videos.reverse().map((video) => (
                <CardVideo key={video.uuid} videoData={video} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Home
