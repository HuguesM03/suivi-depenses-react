import { createClient } from '@supabase/supabase-js'

// Utilisation de tes identifiants
const supabaseUrl = 'https://ybvidotydfhxdgovqbwk.supabase.co'
// On utilise la clé "anon" publique de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlidmlkb3R5ZGZoeGRnb3ZxYndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODc3NjQsImV4cCI6MjA4NTg2Mzc2NH0.17dnKdEf3Qzk_AKhcCz6O2Z_-V6NAs0U6sWUbgSpQAQ' 

export const supabase = createClient(supabaseUrl, supabaseKey)