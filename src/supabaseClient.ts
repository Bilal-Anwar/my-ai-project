import { createClient } from '@supabase/supabase-js'

// Yeh lines `.env` file se values load karengi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Agar keys missing hain to console mein error show karega
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL ya Anon Key missing hai .env file mein!");
}

export const supabase = createClient(supabaseUrl, supabaseKey)