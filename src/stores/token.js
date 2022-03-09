//https://github.com/andsala/svelte-persistent-store#usage
import { writable } from "svelte-persistent-store/dist/session";
// import { session } from "svelte-persistent-store";
// const { writable } = session;

export const token = writable("token", "");
