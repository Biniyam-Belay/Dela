import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

serve(async (req) => {
  try {
    const { type, title, body, data } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Save notification to admin_notifications
    await supabase.from('admin_notifications').insert([{ type, title, body, data }]);

    // Fetch all admin push tokens
    const { data: tokens, error } = await supabase.from('admin_push_tokens').select('token');
    if (error || !tokens || tokens.length === 0) {
      return new Response('No tokens found', { status: 200 });
    }

    // Prepare Expo push messages
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data,
    }));

    // Send push notifications via Expo
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 400 });
  }
});
