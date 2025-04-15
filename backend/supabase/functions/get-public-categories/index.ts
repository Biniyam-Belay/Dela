import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "get-public-categories" up and running!`)

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      // NOTE: We use the ANON KEY here because this is a public endpoint.
      // For protected endpoints, you would pass the Authorization header.
    )

    // Fetch categories from the database
    const { data: categories, error } = await supabaseClient
      .from('categories') // Make sure 'categories' matches your table name
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    // Return the categories
    return new Response(JSON.stringify({ success: true, data: categories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/* To invoke locally:
  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:
  
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get-public-categories' \
    --header 'Authorization: Bearer <YOUR_ANON_KEY>' \
    --header 'Content-Type: application/json'

*/
