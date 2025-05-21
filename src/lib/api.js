import { fetchTimeout } from "../lib/utils/fetchTimeout.js";
import { objectToQuerystring } from "../lib/utils/objectToQuerystring.js";
import { token } from "../stores/token.js";
import { api_host } from "../lib/config/connect.js";

let $token; // Note: can't autosubscribe to token in a function, but using the same name for the token value.
token.subscribe((value) => {
  $token = value;
});

const controller = process.browser ? new AbortController() : null;
const delay = 10000;

/**
 * send
 * Send an HTTP request
 * @param {} method
 * @param {} path
 * @param {} data
 * @param {} token
 * @return {string}
 */

async function send({ method, path, data }) {
  if (!process.browser) return;

  const opts = {
    method: method,
    headers: {},
  };

  let query = "";
  let output;

  if (data) {
    opts.headers["Content-Type"] = "application/json";
    opts.headers["Cache-Control"] = "no-store";

    if (method === "GET") {
      query = `?${objectToQuerystring(data)}`;
    } else {
      opts.body = JSON.stringify(data);
    }
  }

  if ($token) {
    opts.headers["Authorization"] = `Bearer ${$token}`;
  }

  try {
    let response = await fetchTimeout(`${api_host}/${path}${query}`, delay, {
      signal: controller.signal,
      ...opts,
    });

    let contentType = response.headers.get("content-type"); // https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch

    output =
      contentType && contentType.indexOf("application/json") !== -1
        ? await response.json()
        : await response.text();

    // Throws an exception for any status code >= 400.
    if (response.ok === false) {
      // In some cases (e.g. Authentication error) the API hasn't normalized the error response as a {status,message,success} object.
      // We do this manually here, using the response string as message.
      if (typeof output === "string") {
        throw {
          status: response.status,
          message: output,
          success: response.ok,
        };
      } else {
        throw output; // "throw await"? https://stackoverflow.com/a/59102530/494979
      }
    }
    return output;
  } catch (error) {
    // Address non HTTP-related errors.
    if (
      error.message === "The operation was aborted. " ||
      error.message === "NetworkError when attempting to fetch resource."
    )
      throw new Error("Le serveur ne répond pas.");

    throw error;
  }
}

/**
 *
 * @param {*} path
 * @param {*} data
 * @returns {Promise}
 */
export function get(path, data) {
  return send({
    method: "GET",
    path,
    data,
  });
}

export function del(path) {
  return send({
    method: "DELETE",
    path,
  });
}

export function post(path, data) {
  return send({
    method: "POST",
    path,
    data,
  });
}

export function put(path, data) {
  return send({
    method: "PUT",
    path,
    data,
  });
}

export function patch(path, data) {
  return send({
    method: "PATCH",
    path,
    data,
  });
}
