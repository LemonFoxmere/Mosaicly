/**
 * This file stores any environment variables that depends on production / development contexts.
 */

import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

export const SUPABASE_URL = PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = PUBLIC_SUPABASE_ANON_KEY;

export const IS_PROD = import.meta.env.PROD;

// export the root URL
export const BASE_URL = IS_PROD ? "https://mosaicly.io" : "http://localhost:3000";
// export the API URL
export const API_URL = `${BASE_URL}/api`;

export const MOBILE_VIEWPORT_WIDTH = 621;
