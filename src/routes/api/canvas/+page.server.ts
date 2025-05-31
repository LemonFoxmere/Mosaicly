import { fail, type Actions } from "@sveltejs/kit";

// HELPERS

const maxCanvasNameLen = 30;
const isCanvasNameValid = (name: string | null) => {
	return !!name && name.length <= maxCanvasNameLen;
};

const maxLocationDescLen = 200;
const isLocationDescValid = (val: string | null) => {
	return val !== null && val.length <= maxLocationDescLen;
};

const isLocationValid = (longitude: number, latitude: number, accuracy: number) => {
	return (
		!isNaN(longitude) &&
		!isNaN(accuracy) &&
		!isNaN(latitude) &&
		longitude >= -180 &&
		longitude <= 180 &&
		latitude >= -90 &&
		latitude <= 90 &&
		accuracy >= 0 &&
		accuracy <= 100000 // 100km max accuracy
	);
};

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const randomChar = (): string => {
	const idx = Math.floor(Math.random() * ALPHANUM.length);
	return ALPHANUM.charAt(idx);
};

const getRandomBackupCode = (): string => {
	let result = "";
	for (let i = 0; i < 12; i++) {
		result += randomChar();
		if ((i + 1) % 4 === 0 && i !== 11) result += "-";
	}
	return result;
};

// SERVER ACTIONS

export const actions: Actions = {
	/**
	 * Creates a new canvas record for an authenticated user.
	 *
	 * Workflow:
	 * - Ensures the user is authenticated; rejects with HTTP 401 if not.
	 * - Extracts form data including title, location description, longitude, latitude, and accuracy.
	 * - Validates each field:
	 *   - Title and location description are validated for content and format.
	 *   - Longitude, latitude, and accuracy are parsed and validated for geographic correctness.
	 *   - Any validation failure results in HTTP 400 with detailed error information.
	 * - Attempts to insert a new canvas record into the database:
	 *   - Assigns a unique UUID.
	 *   - Generates a random backup code.
	 *   - Stores the geographic location as a PostGIS SRID 4326 POINT.
	 * - If the backup code insertion fails due to duplication, retries once with a new backup code.
	 * - Any other insertion failure results in HTTP 500.
	 * - If insertion succeeds, returns HTTP 200 with the newly created canvas record.
	 */
	createCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401);
		}

		const form = await request.formData();
		const formValues = Object.fromEntries(form);

		const title = form.get("title")?.toString() ?? "";
		const locDesc = form.get("loc_desc")?.toString() ?? "";
		const lonStr = form.get("longitude")?.toString() ?? "";
		const latStr = form.get("latitude")?.toString() ?? "";
		const accStr = form.get("accuracy")?.toString() ?? "";

		if (!isCanvasNameValid(title)) {
			return fail(400, { message: "Invalid canvas title", data: formValues });
		}

		if (!isLocationDescValid(locDesc)) {
			return fail(400, { message: "Invalid location description", data: formValues });
		}

		const longitude = parseFloat(lonStr);
		const latitude = parseFloat(latStr);
		const accuracy = parseFloat(accStr);
		if (!isLocationValid(longitude, latitude, accuracy)) {
			return fail(400, { message: "Invalid longitude or latitude", data: formValues });
		}

		let randomBackupCode = getRandomBackupCode();
		let { data, error } = await supabase
			.from("canvas")
			.insert({
				id: crypto.randomUUID(),
				title,
				loc_desc: locDesc,
				longitude,
				latitude,
				accuracy,
				backup_code: randomBackupCode,
				location: `SRID=4326;POINT(${longitude} ${latitude})`,
				user_id: user.id
			})
			.select();

		if (error) {
			if (
				error.message.indexOf("duplicate key") !== -1 &&
				error.message.indexOf("backup_code") !== -1
			) {
				// duplicate backup code
				randomBackupCode = getRandomBackupCode(); // regen and try again
				({ data, error } = await supabase
					.from("canvas")
					.insert({
						id: crypto.randomUUID(),
						title,
						loc_desc: locDesc,
						longitude,
						latitude,
						accuracy,
						backup_code: randomBackupCode,
						location: `SRID=4326;POINT(${longitude} ${latitude})`,
						user_id: user.id
					})
					.select());
			} else {
				// some other error
				return fail(500, {
					message: "Something went wrong on our side. Reload and try again?",
					data: formValues
				});
			}
		}

		if (!data?.length) {
			return fail(500, {
				message: "We couldn't create your canvas for some reason. Reload and try again?"
			});
		}

		return { success: true, canvas: data[0] };
	},

	/**
	 * Updates an existing canvas record for an authenticated user.
	 *
	 * Workflow:
	 * - Verifies user session; rejects with HTTP 401 if unauthenticated.
	 * - Extracts form data: canvasName, location description, and canvasId.
	 * - Validates canvasName and location description:
	 *   - Rejects with HTTP 400 on invalid input, including form data for client handling.
	 * - Performs database update:
	 *   - Updates title and location description fields for the specified canvasId, but only if it belongs to the current user.
	 *   - Selects and returns the updated record.
	 * - On database error, rejects with HTTP 500 including error message and form data.
	 * - If no record is updated (either non-existent or unauthorized), rejects with HTTP 404 and form data.
	 * - On successful update, returns HTTP 200 with the updated canvas record.
	 */
	updateCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401);
		}

		const form = await request.formData();
		const formValues = Object.fromEntries(form);

		const canvasName = form.get("canvasName")?.toString() ?? "";
		const locDesc = form.get("locDesc")?.toString() ?? "";
		const canvasId = form.get("canvasId")?.toString() ?? "";

		if (!isCanvasNameValid(canvasName)) {
			return fail(400, { message: "Invalid canvas name", data: formValues });
		}

		if (!isLocationDescValid(locDesc)) {
			return fail(400, { message: "Invalid location description", data: formValues });
		}

		const { data, error } = await supabase
			.from("canvas")
			.update({
				title: canvasName,
				loc_desc: locDesc
			})
			.eq("id", canvasId)
			.eq("user_id", user.id)
			.select();

		if (error) {
			// some random error, like the canvas doesn't exist
			return fail(500, {
				message: error.message,
				data: formValues
			});
		}

		if (!data || data.length === 0) {
			return fail(404, {
				message: "Canvas not found or you don't have permission to update it.",
				data: formValues
			});
		}

		return { success: true, canvas: data[0] };
	},

	/**
	 * Toggles the archive state of a canvas record for an authenticated user.
	 *
	 * Workflow:
	 * - Validates user session; rejects with HTTP 401 if unauthenticated.
	 * - Extracts form data: isArchived (as boolean string) and canvasId.
	 * - Validates isArchived input:
	 *   - Must be "true" or "false" string; rejects with HTTP 400 if invalid.
	 * - Updates database record:
	 *   - Inverts the is_archived state for the specified canvasId, but only if it belongs to the current user.
	 *   - Selects and returns the updated record.
	 * - On database error, rejects with HTTP 500 including error message and original form data.
	 * - If no matching record is found (non-existent or unauthorized), rejects with HTTP 404 and form data.
	 * - On successful update, returns HTTP 200 with the updated canvas record.
	 */
	toggleArchiveState: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401);
		}
		const form = await request.formData();
		const formValues = Object.fromEntries(form);

		const isArchivedStr = form.get("isArchived")?.toString() ?? ""; // boolean string, ie "false"
		if (isArchivedStr !== "true" && isArchivedStr !== "false") {
			// safely parse bool
			return fail(400);
		}

		const isCurrentlyArchived: boolean = isArchivedStr === "true"; // OLD data. New one inverts it
		const canvasId = form.get("canvasId")?.toString() ?? ""; // parse canvasId

		const { data, error } = await supabase
			.from("canvas")
			.update({
				is_archived: !isCurrentlyArchived
			})
			.eq("id", canvasId)
			.eq("user_id", user.id)
			.select();

		if (error) {
			// some random error, like the canvas doesn't exist
			return fail(500, {
				message: error.message,
				data: formValues
			});
		}

		if (!data || data.length === 0) {
			return fail(404, {
				message: "Canvas not found or you don't have permission to update it.",
				data: formValues
			});
		}

		return { success: true, canvas: data[0] };
	},

	/**
	 * Deletes a canvas record for an authenticated user.
	 *
	 * Workflow:
	 * - Validates user session; rejects with HTTP 401 if unauthenticated.
	 * - Extracts form data: canvasId.
	 * - Performs database delete:
	 *   - Deletes the record matching canvasId and current user ID.
	 *   - Selects and returns the deleted record.
	 * - On database error, rejects with HTTP 500 including error message and original form data.
	 * - If no matching record is found (non-existent or unauthorized), rejects with HTTP 404 and form data.
	 * - On successful deletion, returns HTTP 200 with the deleted canvas record.
	 */
	deleteCanvas: async ({ request, locals: { user, supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401);
		}

		const form = await request.formData();
		const formValues = Object.fromEntries(form);

		const canvasId = form.get("canvasId")?.toString() ?? "";

		const { data, error } = await supabase
			.from("canvas")
			.delete()
			.eq("id", canvasId)
			.eq("user_id", user.id)
			.select();

		if (error) {
			return fail(500, {
				message: error.message,
				data: formValues
			});
		}

		if (!data || data.length === 0) {
			return fail(404, {
				message: "Canvas not found or you don't have permission to delete it.",
				data: formValues
			});
		}

		return { success: true, canvas: data[0] };
	}
};
