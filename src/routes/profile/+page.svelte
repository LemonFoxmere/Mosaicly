<script lang="ts">
	import CanvasCard from '../../lib/comp/profile/CanvasCard.svelte'

	let { data } = $props()

	const dummyCanvas = [{
		id: '1',
		name: 'My Canvas',
		loc: 'Engineering 2',
		createdOn: new Date()
	}, {
		id: '2',
		name: 'Frog',
		loc: 'Cowell',
		createdOn: new Date()
	}]

	// to be replaced with user data from db (will get from SSR)
	let displayName = 'John Dough'
	let bio = $state('')
	let canvases = $state(dummyCanvas) // obj type

	// toggle between Profile | Canvases tab
	let isProfile = $state(false)
</script>

<main>
	<!-- greet user -->
	<section id="intro">
		<h2>Hello, {displayName}</h2>
		<p>You can edit your profile or manage your canvases here.</p>
	</section>

	<!-- toggle tabs -->
	<section id="tabs-cta">
		<button
			class={`${!isProfile ? 'outline' : 'solid'}-small`}
			onclick={() => (isProfile = true)}
		>
			Profile
		</button>
		<button
			class={`${isProfile ? 'outline' : 'solid'}-small`}
			onclick={() => (isProfile = false)}
		>
			Canvases
		</button>
	</section>

	<section id="edit-content">
		{#if isProfile}
			<!-- profile render -->
			<form method="POST" action="?/update_profile" id="profile_form">
				<label>
					<p class="caption">Display Name</p>
					<input
						name="disp-name"
						type="text"
						placeholder="John Doe"
						value={displayName}
					/>
				</label>

				<label>
					<p class="caption">Bio</p>
					<textarea
						name="bio"
						placeholder="Little bit about yourself"
						rows="3"
						value={bio}
					></textarea>
				</label>

				<button style="margin: 1rem 0">Save</button>
			</form>
		{:else}
			<!-- canvases list render -->
			<div class="canvas_list">
				{#each canvases as canvas}
					<CanvasCard {canvas} />
				{/each}
			</div>
		{/if}
	</section>
</main>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.canvas_list {
	  display: flex;
	  flex-direction: column;
	  gap: 10px;
	}

	main {
	  padding: 20px 30px;
	  width: 100%;
	  height: 100%;

	  display: flex;
	  flex-direction: column;
	  row-gap: 30px;

	  justify-self: center;

	  #intro {
	    display: flex;
	    flex-direction: column;
	    gap: 0.3rem;
	  }

	  #tabs-cta {
	    width: 100%;
	    display: flex;
	    justify-content: center;
	    align-items: center;
	    gap: 10px;

	    button {
	      width: 100%;
	    }
	  }

	  #edit-content {
	    #profile_form {
	      display: flex;
	      flex-direction: column;
	      row-gap: 15px;

	      label {
	        display: flex;
	        flex-direction: column;
	      }
	    }
	  }
	}
</style>
