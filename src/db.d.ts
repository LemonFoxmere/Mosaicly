declare global {
	namespace DB {
		interface UserAccount {
			id?: string;
			username?: string;
			provider?: string;
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
			canvases: Canvas[];
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
