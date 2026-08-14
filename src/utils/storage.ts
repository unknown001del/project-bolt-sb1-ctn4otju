import type { DatabaseProject } from '../types';

export async function saveProject(project: any) {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Attempt insert into 'projects' table; ignore result if fails
      await supabase.from('projects').insert([project]);
      return { ok: true, backend: 'supabase' };
    } catch (err) {
      console.warn('Supabase save failed, falling back to localStorage', err);
    }
  }

  try {
    const all = JSON.parse(localStorage.getItem('nova_projects') || '[]');
    all.push(project);
    localStorage.setItem('nova_projects', JSON.stringify(all));
    return { ok: true, backend: 'local' };
  } catch (err) {
    console.error('LocalStorage save failed', err);
    return { ok: false, error: String(err) };
  }
}
