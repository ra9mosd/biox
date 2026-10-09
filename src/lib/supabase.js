import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ОШИБКА: Не найдены переменные VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY в .env файле');
}

export const supabase = createClient(supabaseUrl, supabaseKey);