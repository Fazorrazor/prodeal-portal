'use server';

import { Resend } from 'resend';
import { createServiceRoleClient } from '../../lib/supabase/server';

// Only initialize Resend if the key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function submitSupportRequest(formData: FormData) {
  try {
    const email = formData.get('email');
    const message = formData.get('message');

    if (!email || !message || typeof email !== 'string' || typeof message !== 'string') {
      return { success: false, error: 'Email and message are required.' };
    }

    // 1. Log the complaint into the admin database FIRST
    const supabaseAdmin = createServiceRoleClient();
    const { error: dbError } = await supabaseAdmin
      .from('support_tickets')
      .insert([
        { email, message, status: 'new' }
      ]);

    if (dbError) {
      console.error('Failed to log support ticket to database:', dbError);
      // We continue to try to send the email even if the DB write fails, or we can fail hard.
      // Failing hard is safer so we don't lose track of it.
      return { success: false, error: 'Failed to record complaint in the system.' };
    }

    // 2. Send the email notification
    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Simulating support email delivery.');
      console.log(`[SIMULATED EMAIL TO sprodeal@gmail.com] From: ${email} | Message: ${message}`);
      return { success: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Prodeal Support <support@prodealindustries.com>', // Or a verified domain you own
      to: 'sprodeal@gmail.com',
      subject: `New Support Request from ${email}`,
      replyTo: email,
      text: `A new support request was submitted via the Prodeal Portal.\n\nFrom: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: 'Failed to send the request. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Support action error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
