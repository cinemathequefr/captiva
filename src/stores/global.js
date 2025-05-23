import { writable } from "svelte-persistent-store/dist/local";
export const global = writable("global", {
  currentProgId: null, // Identifiant du programme sélectionné
  // currentCycleId: null, // 2025-05-20 : Identifiant du cycle sélectionné
  currentFilmId: null, // PK du film sélectionné (non utilisé ?)
  filmEditOrView: "edit", // view | edit
  progs: [182, 184], // TEST : valeurs par défaut de programmes disponibles (pour vérifier que ces valeurs sont bien réécrites avec les valeurs obtenues par requête sur api.cnmtq.fr/progs).
});
