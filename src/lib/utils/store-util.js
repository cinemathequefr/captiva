// From "Svelte and Sapper in Action", p. 126.
// Modified to be usable with Sapper.
import { writable } from "svelte/store";

function persist(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function writableSession(key, initialValue) {
  const sessionValue = process.browser
    ? JSON.parse(sessionStorage.getItem(key))
    : null;
  if (!sessionValue && process.browser) persist(key, initialValue);
  const store = writable(sessionValue || initialValue);
  if (process.browser) {
    store.subscribe((value) => persist(key, value));
  }
  return store;
}
