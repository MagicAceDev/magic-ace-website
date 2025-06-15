export const prerender = false

import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'
import { PUBLIC_HONEYBADGER_KEY, REVISION } from 'astro:env/client'
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from 'astro:env/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(RESEND_API_KEY)
const honeybadger = Honeybadger.configure({
  apiKey: PUBLIC_HONEYBADGER_KEY,
  environment: import.meta.env.DEV ? 'development' : 'production',
  revision: REVISION || 'unknown',
})

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate the request body using Zod
    const formSchema = z.object({
      email: z.string().email(),
      message: z.string().min(1, 'Message is required'),
    })
    const result = formSchema.safeParse(await request.json())

    if (!result.success) {
      // If validation fails, return a 400 response with the error details
      return new Response(JSON.stringify(result.error), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // If validation succeeds, send the email using Resend
    const { email, message } = result.data
    const response = await resend.emails.send({
      from: `Magic Ace <${RESEND_FROM_EMAIL}>`,
      replyTo: email,
      to: 'keeghan@magicace.co.uk',
      subject: 'New Enquiry',
      html: `<p>You have received a new enquiry from <strong>${email}</strong>.</p><p>Message: ${message}</p>`,
    })
    if (!response || response.error) {
      // If the email sending fails, return a 500 response
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    await honeybadger.notifyAsync(error as any)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
