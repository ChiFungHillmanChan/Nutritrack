/**
 * Shared authentication utilities for Supabase Edge Functions
 *
 * Provides JWT validation to ensure only authenticated users
 * can access the Edge Functions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';

export interface AuthResult {
  userId: string;
  email?: string;
}

/**
 * Verify the JWT token from the Authorization header.
 * Returns the authenticated user's info or null if invalid.
 */
export async function verifyAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
  };
}

/**
 * Create an unauthorized response with proper CORS headers.
 */
export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Unauthorized: Valid authentication required',
    }),
    {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
