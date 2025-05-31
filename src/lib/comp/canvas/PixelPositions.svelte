<script lang="ts">
	export class PixelPositionClass {
		map = new Map<string, string>();

		AddPixel(key: [number, number], value: string) {
			this.map.set(JSON.stringify(key), value);
		}

		GetPixel(key: [number, number]): string | undefined {
			return this.map.get(JSON.stringify(key));
		}

		GetAllPixels() {
			this.map.forEach((value, key) => {
				console.log(key, value);
			});
		}

		Clear() {
			this.map.clear();
		}
	}
</script>
