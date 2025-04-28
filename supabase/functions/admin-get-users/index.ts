import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming a shared CORS config

// Define expected user structure from your DB
interface DbUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null; // Adjust type if using enum
  createdAt: string | null; // Assuming timestamp without time zone maps to string initially
}

// Define the structure returned to the frontend
interface FormattedUser {
  id: string;
  profile: {
    full_name: string | null;
  };
  email: string | null;
  role: string | null;
  created_at: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase Admin client (uses Service Role Key from environment)
    // Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your function's environment
    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Authentication/Authorization Check (Enhanced Logging) ---
    console.log("Starting auth check..."); // Log start
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error("Auth check failed: Missing authorization header"); // Log failure reason
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
        console.error('Auth check failed: Invalid token or user not found.', userError); // Log failure reason
        return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    console.log(`Auth check: User ID from token: ${user.id}`); // Log the user ID found

    // Fetch user role from your 'users' table using the authenticated user's ID
    const { data: adminUserData, error: roleError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id) // Ensure this 'id' column exists and matches auth.users.id
        .single();

    if (roleError) {
        // *** Log the specific error object ***
        console.error(`Auth check failed: Error fetching role for user ${user.id}. Details:`, JSON.stringify(roleError, null, 2));
        return new Response(JSON.stringify({ error: 'Could not verify user role' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    console.log(`Auth check: Role data found for user ${user.id}:`, adminUserData); // Log the data found

    // *** THE CRITICAL CHECK ***
    const expectedAdminRole = 'ADMIN'; // Define the expected role value clearly
    const userRole = adminUserData?.role; // Get the role from the fetched data

    console.log(`Auth check: Comparing user role '${userRole}' with expected role '${expectedAdminRole}'`); // Log values being compared

    if (userRole !== expectedAdminRole) {
        console.error(`Auth check failed: User role '${userRole}' does not match expected '${expectedAdminRole}'`); // Log failure reason
        return new Response(JSON.stringify({ error: 'Forbidden: User is not an admin' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    console.log(`Auth check successful for user ${user.id}`); // Log success
    // --- End Authentication/Authorization Check ---


    // Parse query parameters from the request URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || ''; // Role filter from query param
    const offset = (page - 1) * limit;

    // Query the custom public.users table using the Admin client
    let query = supabaseAdmin
      .from('users') // Querying 'public.users'
      .select(`
        id,
        email,
        name,
        role,
        createdAt
      `, { count: 'exact' }); // Fetch count for pagination

    // Apply Search Filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply Role Filter
    if (role) {
      query = query.eq('role', role);
    }

    // Apply Pagination
    query = query.range(offset, offset + limit - 1);

    // Apply Sorting
    query = query.order('name', { ascending: true });

    // Execute the query
    const { data: usersData, error, count } = await query;

    if (error) {
      console.error("Supabase fetch public.users error:", error);
      throw error; // Let the main catch block handle it
    }

    // Format the data
    const formattedUsers: FormattedUser[] = (usersData as DbUser[] || []).map(user => ({
        id: user.id,
        profile: {
            full_name: user.name,
        },
        email: user.email,
        role: user.role,
        created_at: user.createdAt,
    }));

    const totalUsers = count || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Return data in the expected format
    const responsePayload = {
      users: formattedUsers,
      totalPages: totalPages,
      totalUsers: totalUsers,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
