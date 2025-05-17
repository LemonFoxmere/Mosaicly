declare global {
	namespace DB {
		interface UserAccount {
			// EXAMPLE. CHANGE LATER
			id?: string;
			username?: string;
			provider?: string | null;
			createdAt?: Date;
			lastLogin?: Date;
			isDeactivated?: boolean;
			isDeleted?: boolean;
		}
		interface UserProfile {
			displayName?: string | null;
			avatarUrl?: string | null;
			bio?: string | null;
			githubHandle?: string | null;
			discordHandle?: string | null;
		}
		interface AppUser {
			account: UserAccount;
			profile: UserProfile;
		}
		interface Canvas {
			id: string;
			userId: string;
			createdOn: string;

			title: string | null;
			locDesc: string;
			drawing?: Json | null;
			isArchived: bool;

			longitude: number;
			latitude: number;
			accuracy: string;
			location: unknown;
		}
	}
}

export {};
