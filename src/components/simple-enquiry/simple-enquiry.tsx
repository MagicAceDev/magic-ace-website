import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  email: z.string(),
  message: z.string(),
})

export default function SimpleEnquiry() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      message: '',
    },
  })

  const { isSubmitting, isSubmitSuccessful, errors, isSubmitted } =
    form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const resp = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      if (!resp.ok) {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Form {...form}>
      {isSubmitSuccessful && !errors.root && (
        <div className='rounded bg-green-100 p-3 text-green-800'>
          Thank you for your enquiry! We'll be in touch soon.
        </div>
      )}
      {errors.root && (
        <div className='rounded bg-red-100 p-3 text-red-800'>
          {errors.root.message || 'An error occurred. Please try again.'}
        </div>
      )}
      {!isSubmitted && (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='mx-auto max-w-3xl space-y-8'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='john.doe@gmail.com'
                    type='email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Placeholder'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            variant='secondary'
            className='w-full'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      )}
    </Form>
  )
}
