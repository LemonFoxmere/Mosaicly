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
			displayName: string;
			avatarUrl: string;
			bio: string;
			githubHandle: string;
			discordHandle: string;
		}
		interface AppUser {
			account: UserAccount;
			profile: UserProfile;
		}
		interface Canvas {
			id: string;
			userId: string;
			createdOn: string;

			title: string;
			locDesc: string;
			drawing: Json;
			isArchived: bool;

			longitude: number;
			latitude: number;
			accuracy: string;
			location: unknown;
		}
	}
}

export {};
