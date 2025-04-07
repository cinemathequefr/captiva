import { writable } from "svelte-persistent-store/dist/local";
export const global = writable("global", {
  currentProgId: null, // Identifiant du programme sélectionné
  currentFilmId: null, // PK du film sélectionné (non utilisé ?)
  filmEditOrView: "view", // view | edit
  progs: [182, 184], // TEST : valeurs par défaut de programmes disponibles (pour vérifier que ces valeurs sont bien réécrites avec les valeurs obtenues par requête sur api.cnmtq.fr/progs).
});

//import { writable } from "svelte/store";
// export const global = writable({
//   currentProgId: null, // Identifiant du programme sélectionné
//   currentFilmId: null, // PK du film sélectionné
// });
