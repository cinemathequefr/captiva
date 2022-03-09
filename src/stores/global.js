// import { writable } from "svelte-persistent-store/dist/session";
import { writable } from "svelte/store";

export const global = writable({
  currentProgId: null, // Idenfiant du programme sélectionné
  currentFilmId: null, // PK du film sélectionné
});
