import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: { headers: { Authorization: authHeader } },
    db: { schema: 'public' }
  });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Log user details for debugging RLS
    console.log('Authenticated User Details:', JSON.stringify(user, null, 2));

    const body = await req.json();
    // Explicitly extract expected fields, defaulting potentially undefined ones to null
    const name = body.name;
    const description = body.description !== undefined ? body.description : null;
    const image_url = body.image_url !== undefined ? body.image_url : null;

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid category name provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Prepare data for insertion, ensuring empty strings become null if DB prefers NULL
    const insertData = {
      name: name.trim(),
      description: description === '' ? null : description, // Convert empty string to null if needed
      image_url: image_url === '' ? null : image_url     // Convert empty string to null if needed
    };

    const { data, error } = await supabase.from('categories').insert([
      insertData
    ]).select().single();

    if (error) {
      console.error('Supabase insert error:', error); // Log the full error server-side
      // Add more details to the log
      console.error('Insert data attempted:', insertData);

      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (error.code === '23505') {
        return new Response(JSON.stringify({ success: false, error: `A category with the name "${insertData.name}" already exists.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Use 409 Conflict for duplicate resource
        });
      }

      // Check for null constraint violation (PostgreSQL error code 23502)
      if (error.code === '23502') {
         return new Response(JSON.stringify({ success: false, error: `A required field is missing or null.`, details: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Generic error for other database issues
      return new Response(JSON.stringify({ success: false, error: 'Failed to create category in database.', details: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Or 500 if it's likely a server issue
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (err) {
    console.error('Function error:', err); // Log unexpected function errors
    // Handle JSON parsing errors or other unexpected issues
    if (err instanceof SyntaxError) {
       return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    return new Response(JSON.stringify({ success: false, error: 'An unexpected error occurred.', details: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
