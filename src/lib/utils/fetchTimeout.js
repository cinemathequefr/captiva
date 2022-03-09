/**
 * fetchTimeout
 * See: https://stackoverflow.com/a/57888548/494979
 * To use:
 * const controller = new AbortController();
 * let response = await fetchTimeout("example.json", 5000, { signal: controller.signal })
 * @param {*} url
 * @param {*} ms Timeout delay
 * @param {*} param2
 */
export function fetchTimeout(url, ms, { signal, ...options } = {}) {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
}
