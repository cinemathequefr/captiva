import { writable } from "svelte-persistent-store/dist/local";
export const global = writable("global", {
  currentProgId: null, // Identifiant du programme sélectionné
  currentFilmId: null, // PK du film sélectionné
});

//import { writable } from "svelte/store";
// export const global = writable({
//   currentProgId: null, // Identifiant du programme sélectionné
//   currentFilmId: null, // PK du film sélectionné
// });
