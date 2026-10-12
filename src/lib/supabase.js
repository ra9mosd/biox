// Публичный клиент оставлен только для совместимости/публичных чтений.
// Не используй его для записи profiles, links, badges или users.
// VITE_SUPABASE_ANON_KEY не является секретом. SERVICE ROLE KEY сюда помещать НЕЛЬЗЯ.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('BIOX: не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
