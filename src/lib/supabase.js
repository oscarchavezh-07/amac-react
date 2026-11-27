import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('URL:', supabaseUrl);
console.log('¿Existe la clave?', Boolean(supabaseAnonKey));
console.log('Prefijo:', supabaseAnonKey?.substring(0, 15));

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
)