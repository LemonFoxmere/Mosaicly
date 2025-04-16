<script lang="ts">
	let { data } = $props()

	let displayName = 'John Dough'
	let profile_canvas = $state(false)
	let bio = $state('')

	$inspect(profile_canvas)
</script>

<div id="intro">
	<h2>Hello, {displayName}</h2>
	<p>You can edit your profile or manage your canvases here.</p>
</div>

<section id="btn-tabs">
	<button>Profile</button>
	<button class="outline">Canvasess</button>
</section>

<form action="" id="profile">
	<label for="disp_name">
		<p class="field_desc">
			Display Name
		</p>
		<input
			class="input-style"
			type="text"
			placeholder="John Doe"
			value={displayName}
		>
	</label>

	<label>
		<p class="field_desc">
			Bio
		</p>
		<textarea
			class="input-style"
			name="bio"
			placeholder="Little bit about yourself"
			rows="3"
			value={bio}
		></textarea>
	</label>

	<button style="margin: 1rem 0">Save</button>
</form>

<style lang="scss">
	#intro {
	  display: flex;
	  flex-direction: column;
	  gap: 0.3rem;
	}

	button {
	  width: 100%;
	}

	#btn-tabs {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  gap: 10px;
	  margin: 2rem 0;
	}

	#profile {
	  display: flex;
	  flex-direction: column;
	  gap: 1rem;
	}

	label {
	  display: flex;
	  flex-direction: column;
	}

	.field_desc {
	  padding: 0.3rem 0.1rem;
	  opacity: 0.9;
	}

	.input-style {
	  background-color: transparent;
	  border: 2px solid #3a2b26;
	  border-radius: 8px;
	  padding: 1rem 1rem;
	  font-size: 16px;
	  box-shadow: 0 3px #3a2b26;
	  outline: none;
	  color: black; /* 👈 text color added */
	}
	.input-style::placeholder {
	  opacity: 0.3;
	  color: black;
	}

	.input-style:focus {
	  box-shadow:
	    0 4px #3a2b26,
	    0 0 0 2px rgba(0, 0, 0, 0.1); /* glow on focus */
	}
</style>
