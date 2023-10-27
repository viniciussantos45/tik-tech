import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import api from '@/api'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VideoProps } from '@/types/Video'

type FormProps = {
  onSubmit: (data: VideoProps) => void
}

const FormSchema = z.object({
  feature: z.string({
    required_error: 'Fill with a feature'
  }),
  language: z.string({
    required_error: 'Select a language'
  })
})

export const FormComponent = ({ onSubmit }: FormProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  })

  async function handler(data: z.infer<typeof FormSchema>) {
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

    onSubmit(dbData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handler)} className='flex gap-4 items-center'>
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
  )
}
