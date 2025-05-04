import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming a shared CORS config

// Define the structure returned by supabaseAdmin.auth.admin.listUsers()
// Based on Supabase documentation
interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    user_role?: string; // Assuming role is stored here
    [key: string]: any; // Allow other metadata
  };
  user_metadata?: {
    full_name?: string; // Assuming full name is stored here
    [key: string]: any; // Allow other metadata
  };
  // ... other potential fields from auth.users
}

// Define the structure returned to the frontend (matching AdminUserListPage.jsx expectations)
interface FormattedUser {
  id: string;
  profile: {
    full_name: string | null;
  };
  email: string | null;
  role: string | null; // e.g., 'ADMIN', 'Customer'
  created_at: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase Admin client (uses Service Role Key from environment)
    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Authentication/Authorization Check ---
    console.log("Starting auth check...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error("Auth check failed: Missing authorization header");
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !callingUser) {
        console.error('Auth check failed: Invalid token or calling user not found.', userError);
        return new Response(JSON.stringify({ error: 'Invalid token or calling user not found' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    console.log(`Auth check: Calling User ID: ${callingUser.id}`);

    // Fetch calling user's role directly from auth.users app_metadata
    const callingUserRole = callingUser.app_metadata?.user_role;
    const expectedAdminRole = 'ADMIN';

    console.log(`Auth check: Comparing calling user role '${callingUserRole}' with expected role '${expectedAdminRole}'`);

    if (callingUserRole !== expectedAdminRole) {
        console.error(`Auth check failed: Calling user role '${callingUserRole}' does not match expected '${expectedAdminRole}'`);
        return new Response(JSON.stringify({ error: 'Forbidden: User is not an admin' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    console.log(`Auth check successful for calling user ${callingUser.id}`);
    // --- End Authentication/Authorization Check ---


    // Parse query parameters from the request URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || ''; // Role filter from query param

    // Fetch users using the admin API
    // Note: listUsers pagination starts from 0, but our frontend uses 1-based pages
    const { data: listUsersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: page - 1, // Adjust page number for Supabase API (0-based)
      perPage: limit,
      // Note: listUsers doesn't have built-in search or role filtering like SQL.
      // We will filter manually after fetching.
    });

    if (listUsersError) {
      console.error("Supabase auth.admin.listUsers error:", listUsersError);
      throw listUsersError;
    }

    let users: AuthUser[] = listUsersData.users;
    let totalUsers = listUsersData.total ?? users.length; // Use total if available, otherwise count fetched

    // --- Manual Filtering ---
    // Filter by Role (case-insensitive)
    if (role) {
      users = users.filter(user =>
        user.app_metadata?.user_role?.toLowerCase() === role.toLowerCase()
      );
      // Adjust totalUsers based on the filtered list for simplicity here.
      totalUsers = users.length;
    }

    // Filter by Search Term (case-insensitive, checks email and full_name)
    if (search) {
      const searchTermLower = search.toLowerCase();
      users = users.filter(user =>
        user.email?.toLowerCase().includes(searchTermLower) ||
        user.user_metadata?.full_name?.toLowerCase().includes(searchTermLower)
      );
      // Adjust totalUsers based on the filtered list
      totalUsers = users.length;
    }
    // --- End Manual Filtering ---


    // Format the data for the frontend
    const formattedUsers: FormattedUser[] = users.map(user => ({
        id: user.id,
        profile: {
            // Extract full_name from user_metadata
            full_name: user.user_metadata?.full_name || null,
        },
        email: user.email || null,
        // Extract role from app_metadata
        role: user.app_metadata?.user_role || 'Customer', // Default to 'Customer' if not set
        created_at: user.created_at || null,
    }));

    // Recalculate totalPages based on potentially filtered totalUsers
    const totalPages = Math.ceil(totalUsers / limit);

    // Return data in the expected format
    const responsePayload = {
      users: formattedUsers,
      totalPages: totalPages,
      totalUsers: totalUsers, // Return the count after filtering
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
