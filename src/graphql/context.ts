import { createClient } from '@/lib/supabase/server';
import { type User } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export interface GraphQLContext {
  user: User | null;
}

export async function createContext(): Promise<GraphQLContext> {
  try {
    const supabase = await createClient();
    
    // Check if a Bearer token was provided in the request headers
    let token: string | null = null
    try {
      const reqHeaders = await headers()
      const authHeader = reqHeaders.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    } catch {
      // Ignore if headers are not available in this context
    }

    const {
      data: { user },
    } = await (token ? supabase.auth.getUser(token) : supabase.auth.getUser());
    
    return { user };
  } catch (error) {
    console.error('Failed to get context user:', error);
    return { user: null };
  }
}
