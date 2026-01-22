import { createClient } from '@supabase/supabase-js'

// Yeh lines `.env` file se values load karengi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Agar keys missing hain to console mein error show karega
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL ya Anon Key missing hai .env file mein!");
  console.error("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables");
}

// Create client with fallback empty strings to prevent crashes
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key')

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key')
}