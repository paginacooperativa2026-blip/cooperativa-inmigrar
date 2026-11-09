import { createSupabaseServerClient } from './supabase/server';
import { supabaseConfig } from './supabase/config';

export async function identity() {
  if (!supabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return { userId: data.user.id, email: data.user.email.toLowerCase(), supabase };
}

export async function access() {
  const user = await identity();
  if (!user) return null;
  const { data, error } = await user.supabase.from('members').select('role,enabled').eq('user_id', user.userId).maybeSingle();
  if (error || !data?.enabled) return null;
  return { ...user, role: data.role as 'admin' | 'member' };
}

export { sameOrigin } from './request-origin';
