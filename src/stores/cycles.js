import { writable } from "svelte/store";

export const currentCycleId = writable(null); // Id du cycle courant.
export const cyclesList = writable([]); // Objet {idCycle: titreCycle, ...} des cycles du programme courant.
