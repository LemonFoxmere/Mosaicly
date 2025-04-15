import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, ANON_KEY } from '$env/static/private'

export const supabase = createClient(SUPABASE_URL, ANON_KEY)
