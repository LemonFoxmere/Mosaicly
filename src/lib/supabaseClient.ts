import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./@const/dynamic.env";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
	auth: {
		flowType: "pkce",
		autoRefreshToken: false,
		detectSessionInUrl: false,
		persistSession: true
	}
});

// export const BASE_URL = "http://192.168.50.100:3001";
export const BASE_URL = "http://localhost:3000";
