<script lang="ts">
	import type { Snippet } from "svelte";
	import CanvasCard from "$lib/comp/ui/listItems/CanvasCard.svelte";

	interface Props {
		title: string;
		locDesc: string;
		distance: string;
		onClick?: () => void;
		ctaOptions?: Snippet;
	}
	let { title, locDesc, distance, onClick, ctaOptions }: Props = $props();
</script>

<CanvasCard {title} {locDesc} {distance} clickable={true} {onClick} {ctaOptions} />
