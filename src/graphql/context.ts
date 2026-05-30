import { createClient } from '@/lib/supabase/server';
import { type User } from '@supabase/supabase-js';

export interface GraphQLContext {
  user: User | null;
}

export async function createContext(): Promise<GraphQLContext> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { user };
  } catch (error) {
    console.error('Failed to get context user:', error);
    return { user: null };
  }
}
