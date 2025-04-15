import { supabase } from "$lib/supabaseClient.svelte";

  export async function load() {
    const { data } = await supabase.from("canvas").select();
    return {
      canvases: data ?? [],
    };
  }
