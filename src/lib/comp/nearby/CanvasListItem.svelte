<script lang="ts">
	import CanvasCard from "$lib/comp/ui/listItems/CanvasCard.svelte";

	interface Props {
		title: string;
		locDesc: string;
		distance: string;
		onClick?: () => void;
		ctaOptions?: () => any;
	}
	let { title, locDesc, distance, onClick, ctaOptions }: Props = $props();

	const canvas = $derived({
		title,
		locDesc,
		isArchived: false
	} as DB.Canvas);
</script>

<CanvasCard {canvas} clickable={true} {onClick} {ctaOptions}>
	{#snippet caption()}
		<p class="distance">{distance}</p>
	{/snippet}
</CanvasCard>

<style lang="scss">
	@use "$static/stylesheets/guideline" as *;

	.distance {
		font-size: 14px;
		font-weight: 500;
		color: $text-tertiary;
		margin: 0;
	}
</style>
