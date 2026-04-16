import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { sessionOptions, type LabSession } from '@/lib/session';

export async function GET() {
  const session = await getIronSession<LabSession>(await cookies(), sessionOptions);
  if (!session.phone && !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('parts')
    .select('id,name,cat,url,sort_order')
    .eq('is_active', true)
    .order('cat', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by cat
  type Row = { id: string; name: string; cat: string; url: string; sort_order: number };
  const grouped: Record<string, { id: string; name: string; cat: string; url: string }[]> = {
    head: [],
    body: [],
    arm: [],
    leg: [],
  };
  for (const row of (data ?? []) as Row[]) {
    if (grouped[row.cat]) {
      grouped[row.cat].push({ id: row.id, name: row.name, cat: row.cat, url: row.url });
    }
  }
  return NextResponse.json({ parts: grouped });
}
