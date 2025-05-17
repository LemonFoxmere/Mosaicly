// See https://kit.svelte.dev/docs/types#app

import type { SupabaseClient } from "@supabase/supabase-js";

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
			session: Session | null;
			user: User | null;
		}
		// interface PageData {
		// 	session: Session | null;
		// 	supabase: SupabaseClient;
		// }
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	type SupabaseJwt = {
		aud: string;
		exp: number;
		iat: number;
		iss: string;
		sub: string;
		email: string;
		phone: string;
		app_metadata: {
			provider?: string;
			providers?: string[];
			[key: string]: unknown;
		};
		user_metadata: {
			[key: string]: unknown;
		};
		role: string;
		aal: string;
		amr: { method: string; timestamp: number }[];
		session_id: string;
		is_anonymous: boolean;
	};
}
