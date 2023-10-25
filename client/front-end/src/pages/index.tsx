import { Download, FileVideo, Video as VideoIcon } from '@phosphor-icons/react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../components/ui/select'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import api from '@/api'
import { socket } from '@/socket'
import { useEffect, useState } from 'react'
import { useIndexedDB } from 'react-indexed-db-hook'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../components/ui/form'

const FormSchema = z.object({
  feature: z.string({
    required_error: 'Fill with a feature'
  }),
  language: z.string({
    required_error: 'Select a language'
  })
})

type VideoProps = {
  uuid: string
  feature: string
  programming_language: string
  status: string
  status_message: string
}

type PayloadVideoStatus = {
  id: string
  status: string
  status_message: string
}

function Home() {
  const { add, getAll, update } = useIndexedDB('videos')
  const [videos, setVideos] = useState<VideoProps[]>([])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      data: { video_id }
    } = await api.post('/generate', { ...data, programming_language: data.language })

    const dbData = {
      uuid: video_id,
      feature: data.feature,
      programming_language: data.language,
      status: 'pending',
      status_message: 'Your video will be processed soon'
    }

    await add(dbData)

    setVideos((prev) => [...prev, dbData])
  }

  async function loadVideos() {
    const videos = await getAll()

    setVideos(videos)

    return videos
  }

  useEffect(() => {
    loadVideos()
  }, [])

  console.log(videos)

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
        <span className='text-primary text-xl font-bold'>Video Generator</span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-4 items-center'>
          <FormField
            control={form.control}
            name='feature'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature</FormLabel>
                <FormControl>
                  <Input placeholder='Feature' {...field} />
                </FormControl>
                <FormDescription>Feature to explain, it will be used to generate the video</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='language'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-[300px]'>
                      <SelectValue placeholder='Select a language' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Languages</SelectLabel>
                      <SelectItem value='nodejs'>Node JS</SelectItem>
                      <SelectItem value='python'>Python</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FormDescription>Programming language to which the feature belongs</FormDescription>
              </FormItem>
            )}
          />

          <Button type='submit'>Generate</Button>
        </form>
      </Form>

      <div className='flex flex-col gap-2 w-[60%]'>
        {videos.length > 0 && (
          <>
            <p className='text-gray-600 text-md font-bold mt-10'>Your Videos:</p>
            <div className='flex flex-col gap-2 max-h-[320px] overflow-auto pr-[1px]'>
              {videos.reverse().map((video) => {
                const statusColor =
                  video.status === 'pending' || video.status === 'processing' ? 'text-yellow-400' : 'text-green-500'
                const borderColor =
                  video.status === 'pending' || video.status === 'processing' ? 'border-yellow-400' : 'border-green-500'

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
                        <div>
                          <Download size={32} weight='fill' />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Home
