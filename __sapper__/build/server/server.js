'use strict';

var sirv = require('sirv');
var polka = require('polka');
var compression = require('compression');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
require('marked');
var jwt_decode = require('jwt-decode');
var Stream = require('stream');
var http = require('http');
var Url = require('url');
var https = require('https');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var sirv__default = /*#__PURE__*/_interopDefaultLegacy(sirv);
var polka__default = /*#__PURE__*/_interopDefaultLegacy(polka);
var compression__default = /*#__PURE__*/_interopDefaultLegacy(compression);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);
var jwt_decode__default = /*#__PURE__*/_interopDefaultLegacy(jwt_decode);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var Url__default = /*#__PURE__*/_interopDefaultLegacy(Url);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);

function noop$1() { }
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop$1;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
/**
 * Schedules a callback to run immediately after the component has been updated.
 *
 * The first time the callback runs will be after the initial `onMount`
 */
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs#run-time-svelte-ondestroy
 */
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}
/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-setcontext
 */
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
}
Promise.resolve();

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 */
function escape(value, is_attr = false) {
    const str = String(value);
    const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
    pattern.lastIndex = 0;
    let escaped = '';
    let last = 0;
    while (pattern.test(str)) {
        const i = pattern.lastIndex - 1;
        const ch = str[i];
        escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : (ch === '"' ? '&quot;' : '&lt;'));
        last = i + 1;
    }
    return escaped + str.substring(last);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots, context) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(context || (parent_component ? parent_component.$$.context : [])),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, $$slots, context);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    const assignment = (boolean && value === true) ? '' : `="${escape(value, true)}"`;
    return ` ${name}${assignment}`;
}

/* src\routes\index.svelte generated by Svelte v3.53.0 */

const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `${($$result.head += '<!-- HEAD_svelte-marxjf_START -->' + `${($$result.title = `<title>Captiva</title>`, "")}` + '<!-- HEAD_svelte-marxjf_END -->', "")}`;
});

var component_0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Routes
});

/* src\components\ui\SplitPane.svelte generated by Svelte v3.53.0 */

const css$e = {
	code: ".splitter.svelte-1shzo1j{display:block;flex:0 0 auto;width:3px;background-color:#666;cursor:col-resize}.split-pane.svelte-1shzo1j{display:flex;width:100%;max-width:100%;flex:0 0 100%;flex-direction:row;flex-wrap:nowrap;align-items:stretch}.left.svelte-1shzo1j{flex:0 0 25%;display:flex;flex-direction:column;overflow:hidden;background-color:#aaa}.right.svelte-1shzo1j{flex:1 1 75%;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;background-color:#ddd}",
	map: "{\"version\":3,\"file\":\"SplitPane.svelte\",\"sources\":[\"SplitPane.svelte\"],\"sourcesContent\":[\"<!-- https://svelte.dev/repl/d4503273a9014687a85cd87954dae4c0?version=3.44.3 -->\\n<script>\\n  export let leftInitialSize = \\\"50%\\\";\\n\\n  let left;\\n  let isDragging = false;\\n\\n  function dragstart() {\\n    isDragging = true;\\n\\n    document.body.style.userSelect = \\\"none\\\";\\n  }\\n\\n  function drag(e) {\\n    if (!isDragging) return;\\n\\n    const elementLeft = left.getBoundingClientRect().left;\\n    left.style.flexBasis = e.clientX - elementLeft + \\\"px\\\";\\n  }\\n\\n  function dragend() {\\n    if (!isDragging) return;\\n\\n    isDragging = false;\\n    document.body.style.userSelect = \\\"auto\\\";\\n  }\\n</script>\\n\\n<div class=\\\"split-pane\\\" on:mousemove={drag} on:mouseup={dragend}>\\n  <div bind:this={left} class=\\\"left\\\" style=\\\"flex-basis: {leftInitialSize}\\\">\\n    <slot name=\\\"left\\\" />\\n  </div>\\n  <div class=\\\"splitter\\\" on:mousedown={dragstart} />\\n  <div class=\\\"right\\\">\\n    <slot name=\\\"right\\\" />\\n  </div>\\n</div>\\n\\n<style>\\n  .splitter {\\n    display: block;\\n    flex: 0 0 auto;\\n    width: 3px;\\n    background-color: #666;\\n    cursor: col-resize;\\n  }\\n\\n  .split-pane {\\n    display: flex;\\n    width: 100%;\\n    max-width: 100%;\\n\\n    flex: 0 0 100%;\\n    flex-direction: row;\\n    flex-wrap: nowrap;\\n    align-items: stretch;\\n  }\\n\\n  .left {\\n    flex: 0 0 25%;\\n    display: flex;\\n    flex-direction: column;\\n    overflow: hidden;\\n    background-color: #aaa;\\n  }\\n\\n  .right {\\n    flex: 1 1 75%;\\n    display: flex;\\n    flex-direction: column;\\n    overflow-x: hidden;\\n    overflow-y: auto;\\n    background-color: #ddd;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAuCE,SAAS,eAAC,CAAC,AACT,OAAO,CAAE,KAAK,CACd,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,KAAK,CAAE,GAAG,CACV,gBAAgB,CAAE,IAAI,CACtB,MAAM,CAAE,UAAU,AACpB,CAAC,AAED,WAAW,eAAC,CAAC,AACX,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CAEf,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,OAAO,AACtB,CAAC,AAED,KAAK,eAAC,CAAC,AACL,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,MAAM,eAAC,CAAC,AACN,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,MAAM,CAClB,UAAU,CAAE,IAAI,CAChB,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

const SplitPane = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { leftInitialSize = "50%" } = $$props;
	let left;

	if ($$props.leftInitialSize === void 0 && $$bindings.leftInitialSize && leftInitialSize !== void 0) $$bindings.leftInitialSize(leftInitialSize);
	$$result.css.add(css$e);

	return `


<div class="${"split-pane svelte-1shzo1j"}"><div class="${"left svelte-1shzo1j"}" style="${"flex-basis: " + escape(leftInitialSize, true)}"${add_attribute("this", left, 0)}>${slots.left ? slots.left({}) : ``}</div>
  <div class="${"splitter svelte-1shzo1j"}"></div>
  <div class="${"right svelte-1shzo1j"}">${slots.right ? slots.right({}) : ``}</div>
</div>`;
});

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable$2(value, start = noop$1) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop$1) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop$1;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

// src/generator.ts
function isSimpleDeriver(deriver) {
  return deriver.length < 2;
}
function generator(storage) {
  function readable(key, value, start) {
    return {
      subscribe: writable(key, value, start).subscribe
    };
  }
  function writable(key, value, start = noop$1) {
    function wrap_start(ogSet) {
      return start(function wrap_set(new_value) {
        if (storage) {
          storage.setItem(key, JSON.stringify(new_value));
        }
        return ogSet(new_value);
      });
    }
    if (storage) {
      if (storage.getItem(key)) {
        value = JSON.parse(storage.getItem(key));
      }
      storage.setItem(key, JSON.stringify(value));
    }
    const ogStore = writable$2(value, start ? wrap_start : void 0);
    function set(new_value) {
      if (storage) {
        storage.setItem(key, JSON.stringify(new_value));
      }
      ogStore.set(new_value);
    }
    function update(fn) {
      set(fn(get_store_value(ogStore)));
    }
    function subscribe(run, invalidate = noop$1) {
      return ogStore.subscribe(run, invalidate);
    }
    return {set, update, subscribe};
  }
  function derived(key, stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (storage && storage.getItem(key)) {
      initial_value = JSON.parse(storage.getItem(key));
    }
    return readable(key, initial_value, (set) => {
      let inited = false;
      const values = [];
      let pending = 0;
      let cleanup = noop$1;
      const sync = () => {
        if (pending) {
          return;
        }
        cleanup();
        const input = single ? values[0] : values;
        if (isSimpleDeriver(fn)) {
          set(fn(input));
        } else {
          const result = fn(input, set);
          cleanup = is_function(result) ? result : noop$1;
        }
      };
      const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
        values[i] = value;
        pending &= ~(1 << i);
        if (inited) {
          sync();
        }
      }, () => {
        pending |= 1 << i;
      }));
      inited = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
      };
    });
  }
  return {
    readable,
    writable,
    derived,
    get: get_store_value
  };
}

// src/session.ts
var storage$1 = typeof window !== "undefined" ? window.sessionStorage : void 0;
var g$1 = generator(storage$1);
var writable$1 = g$1.writable;

//https://github.com/andsala/svelte-persistent-store#usage
// import { session } from "svelte-persistent-store";
// const { writable } = session;

const token = writable$1("token", "");

token.subscribe((value) => {
});

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
  return;
}

/**
 *
 * @param {*} path
 * @param {*} data
 * @returns {Promise}
 */
function get(path, data) {
  return send({
    method: "GET",
    path,
    data,
  });
}

function post(path, data) {
  return send({
    method: "POST",
    path,
    data,
  });
}

function put(path, data) {
  return send({
    method: "PUT",
    path,
    data,
  });
}

const films = writable$2({
  currentFilmsList: [],
  currentFilmPk: null,
  currentFilmEditingStatus: null,
});

/* src\components\films\FilmView.svelte generated by Svelte v3.53.0 */

const css$d = {
	code: ".container.svelte-t03gsb{margin:12px auto;width:100%;max-width:600px;padding:12px;flex:0 0 auto;align-self:flex-start;background-color:#ddd}",
	map: "{\"version\":3,\"file\":\"FilmView.svelte\",\"sources\":[\"FilmView.svelte\"],\"sourcesContent\":[\"<script>\\n  import _ from \\\"lodash\\\";\\n  import { get } from \\\"../../lib/api.js\\\";\\n  import { films } from \\\"../../stores/films.js\\\";\\n\\n  let pk;\\n  let film;\\n  let oldPk;\\n\\n  $: {\\n    // DONE: Empêche le rechargement intempestif du component quand on sélectionne un autre cycle.\\n    // TODO: Améliorer.\\n    oldPk = pk;\\n    pk = $films.currentFilmPk;\\n\\n    if (pk && oldPk !== pk) {\\n      film = get(`film/${pk}`);\\n      film.then((f) => {\\n        $films.currentFilmEditingStatus = f.editing_status;\\n      });\\n    }\\n  }\\n</script>\\n\\n<!-- {JSON.stringify($films, null, 2)} -->\\n{#if pk}\\n  {#await film then film}\\n    <div class=\\\"container\\\">\\n      <div>{film.art} {film.titre}</div>\\n      <div>({film.artvo} {film.titrevo})</div>\\n      <div>de {film.realisateurs}</div>\\n      <div>{film.pays} / {film.annee} / {film.duree}</div>\\n      <div>{film.adaptation}</div>\\n      <div>Avec {film.generique}.</div>\\n      <div>{film.synopsis}</div>\\n      <div>{film.commentaire}</div>\\n      <div>{film.mentions}</div>\\n      <div>{film.synopsisjp}</div>\\n    </div>\\n  {/await}\\n{/if}\\n\\n<style>\\n  .container {\\n    margin: 12px auto;\\n    width: 100%;\\n    max-width: 600px;\\n    padding: 12px;\\n    flex: 0 0 auto;\\n    align-self: flex-start;\\n    background-color: #ddd;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA2CE,UAAU,cAAC,CAAC,AACV,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,UAAU,CACtB,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

const FilmView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $films, $$unsubscribe_films;
	$$unsubscribe_films = subscribe(films, value => $films = value);
	let pk;
	let film;
	let oldPk;
	$$result.css.add(css$d);

	{
		{
			// DONE: Empêche le rechargement intempestif du component quand on sélectionne un autre cycle.
			// TODO: Améliorer.
			oldPk = pk;

			pk = $films.currentFilmPk;

			if (pk && oldPk !== pk) {
				film = get(`film/${pk}`);

				film.then(f => {
					set_store_value(films, $films.currentFilmEditingStatus = f.editing_status, $films);
				});
			}
		}
	}

	$$unsubscribe_films();

	return `
${pk
	? `${(function (__value) {
			if (is_promise(__value)) {
				__value.then(null, noop$1);
				return ``;
			}

			return (function (film) {
				return `
    <div class="${"container svelte-t03gsb"}"><div>${escape(film.art)} ${escape(film.titre)}</div>
      <div>(${escape(film.artvo)} ${escape(film.titrevo)})</div>
      <div>de ${escape(film.realisateurs)}</div>
      <div>${escape(film.pays)} / ${escape(film.annee)} / ${escape(film.duree)}</div>
      <div>${escape(film.adaptation)}</div>
      <div>Avec ${escape(film.generique)}.</div>
      <div>${escape(film.synopsis)}</div>
      <div>${escape(film.commentaire)}</div>
      <div>${escape(film.mentions)}</div>
      <div>${escape(film.synopsisjp)}</div></div>
  `;
			})(__value);
		})(film)}`
	: ``}`;
});

/* src\components\lib\Form.svelte generated by Svelte v3.53.0 */

const css$c = {
	code: "form{width:100%;display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:flex-start;align-items:flex-start}fieldset{width:100%;flex:0 0 auto;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;align-items:flex-start;align-content:flex-start;margin:0;border:0;padding:4px 0 0 0}fieldset.buttons-container{margin:12px 0;justify-content:flex-end}fieldset.buttons-container label{flex-grow:0}form label{flex:1 1 auto;margin:0 3px 0 0}form label > div{font-size:0.75rem;color:#888}input[type=\"text\"], textarea, select{width:100%;font-size:0.938rem;border:none;padding:8px;background-color:#eee;outline:none}input[type=\"text\"], select{line-height:1rem}input[type=\"text\"]:focus, textarea:focus{background-color:#fff}textarea{resize:vertical;height:8rem;min-height:38px}textarea.single-line{height:38px}.bold{font-weight:700}button, input[type=\"submit\"]{margin:2px;padding:8px 12px;border:none;border-radius:4px;transition:0.1s}button.mini, input[type=\"submit\"].mini{font-size:0.75em;padding:2px 4px}button.yes, input[type=\"submit\"].yes{background-color:#686;color:#fff}button.no, input[type=\"submit\"].no{background-color:#f99;border-color:#933}button.no:hover, input[type=\"submit\"].no:hover{background-color:#c66}",
	map: "{\"version\":3,\"file\":\"Form.svelte\",\"sources\":[\"Form.svelte\"],\"sourcesContent\":[\"<script>\\n  import { onMount } from \\\"svelte\\\";\\n\\n  export let options;\\n  export let submit;\\n\\n  let elForm;\\n\\n  options = Object.assign({ textareaFitContent: false }, options);\\n\\n  onMount(async () => {\\n    // Ajuste initialement la hauteur des <textarea> à leur contenu.\\n    if (options.textareaFitContent === true) {\\n      let textareas = elForm.querySelectorAll(\\\"textarea\\\");\\n      for (let i = 0; i < textareas.length; i++) {\\n        let t = textareas[i];\\n        updateTextareaHeight(t);\\n        t.addEventListener(\\\"input\\\", () => updateTextareaHeight(t));\\n      }\\n\\n      function updateTextareaHeight(t) {\\n        if (t.scrollHeight > t.offsetHeight)\\n          t.style.height = `${t.scrollHeight + 2}px`;\\n      }\\n    }\\n  });\\n</script>\\n\\n<form bind:this={elForm} on:submit|preventDefault={submit}>\\n  <slot />\\n</form>\\n\\n<style>\\n  :global(form) {\\n    width: 100%;\\n    display: flex;\\n    flex-direction: column;\\n    flex-wrap: nowrap;\\n    justify-content: flex-start;\\n    align-items: flex-start;\\n  }\\n\\n  :global(fieldset) {\\n    width: 100%;\\n    flex: 0 0 auto;\\n    display: flex;\\n    flex-direction: row;\\n    flex-wrap: nowrap;\\n    justify-content: flex-start;\\n    align-items: flex-start;\\n    align-content: flex-start;\\n    margin: 0;\\n    border: 0;\\n    padding: 4px 0 0 0;\\n  }\\n\\n  :global(fieldset.buttons-container) {\\n    margin: 12px 0;\\n    justify-content: flex-end;\\n  }\\n\\n  :global(fieldset.buttons-container label) {\\n    flex-grow: 0;\\n  }\\n\\n  :global(form label) {\\n    flex: 1 1 auto;\\n    margin: 0 3px 0 0;\\n  }\\n\\n  :global(form label > div) {\\n    font-size: 0.75rem;\\n    color: #888;\\n  }\\n\\n  :global(input[type=\\\"text\\\"], textarea, select) {\\n    width: 100%;\\n    font-size: 0.938rem;\\n    border: none;\\n    padding: 8px;\\n    background-color: #eee;\\n    outline: none;\\n  }\\n\\n  :global(input[type=\\\"text\\\"], select) {\\n    line-height: 1rem;\\n  }\\n\\n  :global(input[type=\\\"text\\\"]:focus, textarea:focus) {\\n    background-color: #fff;\\n  }\\n\\n  :global(textarea) {\\n    resize: vertical;\\n    height: 8rem;\\n    min-height: 38px;\\n  }\\n\\n  :global(textarea.single-line) {\\n    height: 38px;\\n  }\\n\\n  :global(.bold) {\\n    font-weight: 700;\\n  }\\n\\n  :global(button, input[type=\\\"submit\\\"]) {\\n    margin: 2px;\\n    padding: 8px 12px;\\n    border: none;\\n    border-radius: 4px;\\n    /* border: solid 1px #999;\\n    cursor: pointer; */\\n    transition: 0.1s;\\n  }\\n\\n  :global(button.mini, input[type=\\\"submit\\\"].mini) {\\n    font-size: 0.75em;\\n    padding: 2px 4px;\\n  }\\n\\n  :global(button.yes, input[type=\\\"submit\\\"].yes) {\\n    background-color: #686;\\n    color: #fff;\\n    /* border-color: #396; */\\n  }\\n\\n  /*\\n  :global(button.yes:hover, input[type=\\\"submit\\\"].yes:hover) {\\n    background-color: #6c9;\\n  }\\n  */\\n\\n  /*\\n  :global(button.yes, input[type=\\\"submit\\\"].yes) {\\n    background-color: #9fc;\\n    border-color: #396;\\n  }\\n\\n  :global(button.yes:hover, input[type=\\\"submit\\\"].yes:hover) {\\n    background-color: #6c9;\\n  }\\n  */\\n\\n  :global(button.no, input[type=\\\"submit\\\"].no) {\\n    background-color: #f99;\\n    border-color: #933;\\n  }\\n\\n  :global(button.no:hover, input[type=\\\"submit\\\"].no:hover) {\\n    background-color: #c66;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAiCU,IAAI,AAAE,CAAC,AACb,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,UAAU,CAC3B,WAAW,CAAE,UAAU,AACzB,CAAC,AAEO,QAAQ,AAAE,CAAC,AACjB,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,UAAU,CAC3B,WAAW,CAAE,UAAU,CACvB,aAAa,CAAE,UAAU,CACzB,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACpB,CAAC,AAEO,0BAA0B,AAAE,CAAC,AACnC,MAAM,CAAE,IAAI,CAAC,CAAC,CACd,eAAe,CAAE,QAAQ,AAC3B,CAAC,AAEO,gCAAgC,AAAE,CAAC,AACzC,SAAS,CAAE,CAAC,AACd,CAAC,AAEO,UAAU,AAAE,CAAC,AACnB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,MAAM,CAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AACnB,CAAC,AAEO,gBAAgB,AAAE,CAAC,AACzB,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,AACb,CAAC,AAEO,oCAAoC,AAAE,CAAC,AAC7C,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,QAAQ,CACnB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CACZ,gBAAgB,CAAE,IAAI,CACtB,OAAO,CAAE,IAAI,AACf,CAAC,AAEO,0BAA0B,AAAE,CAAC,AACnC,WAAW,CAAE,IAAI,AACnB,CAAC,AAEO,wCAAwC,AAAE,CAAC,AACjD,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAEO,QAAQ,AAAE,CAAC,AACjB,MAAM,CAAE,QAAQ,CAChB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,AAClB,CAAC,AAEO,oBAAoB,AAAE,CAAC,AAC7B,MAAM,CAAE,IAAI,AACd,CAAC,AAEO,KAAK,AAAE,CAAC,AACd,WAAW,CAAE,GAAG,AAClB,CAAC,AAEO,4BAA4B,AAAE,CAAC,AACrC,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAGlB,UAAU,CAAE,IAAI,AAClB,CAAC,AAEO,sCAAsC,AAAE,CAAC,AAC/C,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,GAAG,CAAC,GAAG,AAClB,CAAC,AAEO,oCAAoC,AAAE,CAAC,AAC7C,gBAAgB,CAAE,IAAI,CACtB,KAAK,CAAE,IAAI,AAEb,CAAC,AAmBO,kCAAkC,AAAE,CAAC,AAC3C,gBAAgB,CAAE,IAAI,CACtB,YAAY,CAAE,IAAI,AACpB,CAAC,AAEO,8CAA8C,AAAE,CAAC,AACvD,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

const Form = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { options } = $$props;
	let { submit } = $$props;
	let elForm;
	options = Object.assign({ textareaFitContent: false }, options);

	onMount(async () => {
		// Ajuste initialement la hauteur des <textarea> à leur contenu.
		if (options.textareaFitContent === true) {
			let textareas = elForm.querySelectorAll("textarea");

			for (let i = 0; i < textareas.length; i++) {
				let t = textareas[i];
				updateTextareaHeight(t);
				t.addEventListener("input", () => updateTextareaHeight(t));
			}

			function updateTextareaHeight(t) {
				if (t.scrollHeight > t.offsetHeight) t.style.height = `${t.scrollHeight + 2}px`;
			}
		}
	});

	if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
	if ($$props.submit === void 0 && $$bindings.submit && submit !== void 0) $$bindings.submit(submit);
	$$result.css.add(css$c);

	return `<form${add_attribute("this", elForm, 0)}>${slots.default ? slots.default({}) : ``}
</form>`;
});

/**
 * convertObjectValuesToNum
 * Renvoie une copie de l'objet `o` dans laquelle les valeurs des clés listées dans `keys` sont converties au format numérique.
 * Si une clé listée dans `keys` n'est pas présente dans l'objet, elle est sans effet.
 * Si la conversion d'une valeur échoue, la valeur d'origine (chaîne) est renvoyée.
 * (MODIFIÉ) ATTENTION : une chaîne vide est convertie en 0 (effets potentiellement indésirables).
 * Utilisé typiquement sur des données provenant d'un formulaire HTML, dans lequel les champs numériques sont exprimés par une chaîne.
 * 2024-05-22 : une chaîne vide n'est pas convertie (elle est préservée).
 * @param o {Object}
 * @param keys {Array:string}
 */
var convertObjectValuesToNum = function convertObjectValuesToNum(o, keys) {
  return ___default["default"](___default["default"].cloneDeep(o))
    .mapValues((v, k) => {
      const conv = v === "" ? NaN : Number(v); // Nombre ou isNaN
      return ___default["default"].indexOf(keys, k) > -1 ? (isNaN(conv) ? v : conv) : v;
    })
    .value();
};

/* src\components\EditingStatus.svelte generated by Svelte v3.53.0 */

const css$b = {
	code: "svg.svelte-1v9ftzt.svelte-1v9ftzt{display:inline-block}svg.svelte-1v9ftzt>circle.svelte-1v9ftzt{fill:transparent}.status0.svelte-1v9ftzt.svelte-1v9ftzt{fill:#fd1c3a}.status1.svelte-1v9ftzt.svelte-1v9ftzt{fill:#fdb61e}.status2.svelte-1v9ftzt.svelte-1v9ftzt{fill:#18bd78}.status3.svelte-1v9ftzt.svelte-1v9ftzt{fill:#1878bd}",
	map: "{\"version\":3,\"file\":\"EditingStatus.svelte\",\"sources\":[\"EditingStatus.svelte\"],\"sourcesContent\":[\"<script>\\n  export let status;\\n  export let size = 12;\\n</script>\\n\\n<svg\\n  style=\\\"width:{size}px; height:{size}px;\\\"\\n  viewBox=\\\"0 0 100 100\\\"\\n  xmlns=\\\"http://www.w3.org/2000/svg\\\"\\n>\\n  <circle class=\\\"status{status}\\\" cx=\\\"50\\\" cy=\\\"60\\\" r=\\\"30\\\" />\\n</svg>\\n\\n<style>\\n  svg {\\n    display: inline-block;\\n  }\\n\\n  svg > circle {\\n    fill: transparent;\\n  }\\n  .status0 {\\n    fill: #fd1c3a;\\n  }\\n  .status1 {\\n    fill: #fdb61e;\\n  }\\n  .status2 {\\n    fill: #18bd78;\\n  }\\n  .status3 {\\n    fill: #1878bd;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAcE,GAAG,8BAAC,CAAC,AACH,OAAO,CAAE,YAAY,AACvB,CAAC,AAED,kBAAG,CAAG,MAAM,eAAC,CAAC,AACZ,IAAI,CAAE,WAAW,AACnB,CAAC,AACD,QAAQ,8BAAC,CAAC,AACR,IAAI,CAAE,OAAO,AACf,CAAC,AACD,QAAQ,8BAAC,CAAC,AACR,IAAI,CAAE,OAAO,AACf,CAAC,AACD,QAAQ,8BAAC,CAAC,AACR,IAAI,CAAE,OAAO,AACf,CAAC,AACD,QAAQ,8BAAC,CAAC,AACR,IAAI,CAAE,OAAO,AACf,CAAC\"}"
};

const EditingStatus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { status } = $$props;
	let { size = 12 } = $$props;
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	$$result.css.add(css$b);
	return `<svg style="${"width:" + escape(size, true) + "px; height:" + escape(size, true) + "px;"}" viewBox="${"0 0 100 100"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"svelte-1v9ftzt"}"><circle class="${"status" + escape(status, true) + " svelte-1v9ftzt"}" cx="${"50"}" cy="${"60"}" r="${"30"}"></circle></svg>`;
});

/* src\components\ui\Snackbar.svelte generated by Svelte v3.53.0 */

const css$a = {
	code: ".snackbar.svelte-10xvst6{display:flex;align-items:center;border-radius:4px;padding:6px 16px;margin:4px 0;min-height:48px;min-width:144px;max-width:568px;position:fixed;flex-wrap:nowrap;z-index:50;box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2),\n      0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12)}.snackbar-content.svelte-10xvst6{text-align:center;flex:1 1 auto}.top.svelte-10xvst6{top:0;left:50%;transform:translate3d(-50%, 0, 0)}.bottom.svelte-10xvst6{bottom:0;left:50%;border-radius:2px 2px 0 0;transform:translate3d(-50%, 0, 0)}@media only screen and (max-width: 600px){.snackbar.svelte-10xvst6{max-width:100%;left:0;right:0;transform:translate3d(0, 0, 0)}}",
	map: "{\"version\":3,\"file\":\"Snackbar.svelte\",\"sources\":[\"Snackbar.svelte\"],\"sourcesContent\":[\"<!-- D'après https://github.com/vikignt/svelte-mui/blob/master/src/Snackbar.svelte -->\\n<script>\\n  import { onDestroy, createEventDispatcher, onMount } from \\\"svelte\\\";\\n  import { fly } from \\\"svelte/transition\\\";\\n  const dispatch = createEventDispatcher();\\n  export let visible = false;\\n  export { className as class };\\n  let className = \\\"\\\";\\n  export let style = \\\"\\\";\\n  export let bottom = true;\\n  export let bg = \\\"#9fc\\\";\\n  export let color = \\\"#000\\\";\\n  export let timeout = 1.5;\\n\\n  let timerId;\\n  $: if (visible === true) {\\n    clearTimeout(timerId);\\n    timerId = undefined;\\n    if (timeout > 0) {\\n      timerId = setTimeout(() => {\\n        visible = false;\\n        timerId = undefined;\\n      }, timeout * 1000);\\n    }\\n  }\\n  onDestroy(() => {\\n    clearTimeout(timerId);\\n    timerId = undefined;\\n  });\\n  function iend({ target }) {\\n    dispatch(\\\"open\\\");\\n  }\\n  function oend({ target }) {\\n    dispatch(\\\"close\\\");\\n  }\\n</script>\\n\\n{#if visible}\\n  <div\\n    in:fly={{ y: bottom ? 48 : -48, duration: 350 }}\\n    out:fly={{ y: bottom ? 48 : -48, duration: 350 }}\\n    on:introend={(e) => iend(e)}\\n    on:outroend={(e) => oend(e)}\\n    class={\\\"snackbar \\\" + className}\\n    class:top={!bottom}\\n    class:bottom\\n    style={`color: ${color}; background: ${bg};${style}`}\\n  >\\n    <div class=\\\"snackbar-content\\\">\\n      <slot />\\n    </div>\\n  </div>\\n{/if}\\n\\n<style>\\n  .snackbar {\\n    display: flex;\\n    align-items: center;\\n    border-radius: 4px;\\n    padding: 6px 16px;\\n    margin: 4px 0;\\n    min-height: 48px;\\n    min-width: 144px;\\n    max-width: 568px;\\n    position: fixed;\\n    flex-wrap: nowrap;\\n    z-index: 50;\\n    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),\\n      0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);\\n  }\\n  /* .action {\\n    margin-right: -16px;\\n    padding: 0 8px;\\n    margin-left: auto;\\n  } */\\n\\n  .snackbar-content {\\n    text-align: center;\\n    flex: 1 1 auto;\\n  }\\n\\n  .top {\\n    top: 0;\\n    left: 50%;\\n    transform: translate3d(-50%, 0, 0);\\n  }\\n  .bottom {\\n    bottom: 0;\\n    left: 50%;\\n    border-radius: 2px 2px 0 0;\\n    transform: translate3d(-50%, 0, 0);\\n  }\\n  @media only screen and (max-width: 600px) {\\n    .snackbar {\\n      max-width: 100%;\\n      left: 0;\\n      right: 0;\\n      transform: translate3d(0, 0, 0);\\n    }\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAuDE,SAAS,eAAC,CAAC,AACT,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,KAAK,CAChB,SAAS,CAAE,KAAK,CAChB,QAAQ,CAAE,KAAK,CACf,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC;MAC5C,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,AACtE,CAAC,AAOD,iBAAiB,eAAC,CAAC,AACjB,UAAU,CAAE,MAAM,CAClB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,AAChB,CAAC,AAED,IAAI,eAAC,CAAC,AACJ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,YAAY,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACpC,CAAC,AACD,OAAO,eAAC,CAAC,AACP,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,GAAG,CACT,aAAa,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAC1B,SAAS,CAAE,YAAY,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACpC,CAAC,AACD,OAAO,IAAI,CAAC,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzC,SAAS,eAAC,CAAC,AACT,SAAS,CAAE,IAAI,CACf,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,SAAS,CAAE,YAAY,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,AACjC,CAAC,AACH,CAAC\"}"
};

const Snackbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	createEventDispatcher();
	let { visible = false } = $$props;
	let { class: className = "" } = $$props;
	let { style = "" } = $$props;
	let { bottom = true } = $$props;
	let { bg = "#9fc" } = $$props;
	let { color = "#000" } = $$props;
	let { timeout = 1.5 } = $$props;
	let timerId;

	onDestroy(() => {
		clearTimeout(timerId);
		timerId = undefined;
	});

	if ($$props.visible === void 0 && $$bindings.visible && visible !== void 0) $$bindings.visible(visible);
	if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
	if ($$props.style === void 0 && $$bindings.style && style !== void 0) $$bindings.style(style);
	if ($$props.bottom === void 0 && $$bindings.bottom && bottom !== void 0) $$bindings.bottom(bottom);
	if ($$props.bg === void 0 && $$bindings.bg && bg !== void 0) $$bindings.bg(bg);
	if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
	if ($$props.timeout === void 0 && $$bindings.timeout && timeout !== void 0) $$bindings.timeout(timeout);
	$$result.css.add(css$a);

	{
		if (visible === true) {
			clearTimeout(timerId);
			timerId = undefined;

			if (timeout > 0) {
				timerId = setTimeout(
					() => {
						visible = false;
						timerId = undefined;
					},
					timeout * 1000
				);
			}
		}
	}

	return `


${visible
	? `<div class="${[
			escape(null_to_empty("snackbar " + className), true) + " svelte-10xvst6",
			(!bottom ? "top" : "") + ' ' + (bottom ? "bottom" : "")
		].join(' ').trim()}"${add_attribute("style", `color: ${color}; background: ${bg};${style}`, 0)}><div class="${"snackbar-content svelte-10xvst6"}">${slots.default ? slots.default({}) : ``}</div></div>`
	: ``}`;
});

/* src\components\films\FilmEdit.svelte generated by Svelte v3.53.0 */

const { Object: Object_1 } = globals;

const css$9 = {
	code: ".container.svelte-1odd7pr.svelte-1odd7pr{margin:12px auto;width:100%;max-width:600px;padding:12px;flex:0 0 auto;align-self:flex-start;background-color:#ddd}.status-container.svelte-1odd7pr.svelte-1odd7pr{display:inline-block;font-size:0.75rem;padding:0 2px 0 0;border:solid 1px #888;color:#666;border-radius:4px;user-select:none}a.svelte-1odd7pr.svelte-1odd7pr{color:inherit;border:none;text-decoration:none;padding:0;margin:0;font-size:1rem}.small-link.svelte-1odd7pr.svelte-1odd7pr{display:inline-block;font-size:0.875rem;color:#666;padding:0 2px;text-decoration:underline}.clip.svelte-1odd7pr.svelte-1odd7pr{display:inline-block;font-size:1rem;color:#444;background-color:#ccc;padding:0 4px;margin:0 2px 0 0;cursor:copy}label.svelte-1odd7pr a.svelte-1odd7pr{font-size:inherit;padding:0 0 0 4px}label.svelte-1odd7pr a.check.svelte-1odd7pr{color:#69f}.hi.svelte-1odd7pr.svelte-1odd7pr{background-color:#cfe}input.svelte-1odd7pr.svelte-1odd7pr:disabled{background-color:transparent}input.svelte-1odd7pr.svelte-1odd7pr:read-only{background-color:#ccc;color:#444}",
	map: "{\"version\":3,\"file\":\"FilmEdit.svelte\",\"sources\":[\"FilmEdit.svelte\"],\"sourcesContent\":[\"<script>\\n  import _ from \\\"lodash\\\";\\n  import { get, put } from \\\"../../lib/api.js\\\";\\n  import { films } from \\\"../../stores/films.js\\\";\\n  import Form from \\\"../lib/Form.svelte\\\";\\n  import cudm from \\\"../../lib/format/cudm\\\";\\n  import convertObjectValuesToNum from \\\"../../../src/lib/utils/convertObjectValuesToNum.js\\\";\\n  import EditingStatus from \\\"../EditingStatus.svelte\\\";\\n  import Snackbar from \\\"../ui/Snackbar.svelte\\\";\\n\\n  let oldPk;\\n  let pk;\\n  let film;\\n\\n  let snackbar = {\\n    visible: false,\\n    message: \\\"\\\",\\n    props: {}, // bottom, bg, color, style, timeout\\n  };\\n\\n  $: {\\n    // DONE: Empêche le rechargement intempestif du component quand on sélectionne un autre cycle.\\n    // TODO: Améliorer.\\n    oldPk = pk;\\n    pk = $films.currentFilmPk;\\n    if (pk && oldPk !== pk) {\\n      film = get(`film/${pk}`);\\n      film.then((f) => {\\n        $films.currentFilmEditingStatus = f.editing_status;\\n      });\\n    }\\n  }\\n\\n  function updateFilm(e) {\\n    let formData = new FormData(e.target);\\n    let film = [];\\n    for (let [k, v] of formData.entries()) {\\n      film.push([k, v]);\\n    }\\n    film = Object.assign(_.fromPairs(film));\\n\\n    film = convertObjectValuesToNum(film, [\\n      \\\"annee\\\",\\n      \\\"duree\\\", // <--- Ajout (2024-05-23)\\n      \\\"editing_status\\\",\\n      \\\"ageminimal\\\", // Une chaîne vide (ageminimal non spécifié) renvoie 0.\\n      \\\"id_boxoffice\\\",\\n    ]);\\n\\n    if (film.ageminimal === 0) film = _.omit(film, \\\"ageminimal\\\");\\n\\n    // 2024-05-22 : On retire les propriétés dont la valeur est une chaîne vide.\\n    film = _(film)\\n      .omitBy((v) => v === \\\"\\\")\\n      .value();\\n\\n    // (NOTE du 2024-05-22) Une requête PUT (et non PATCH) aura pour effet que les champs non transmis (notamment les \\\"\\\" retirées ci-dessus) seront bien réécrits dans la table, avec la valeur par défaut du champ.\\n    put(`film/${pk}`, film)\\n      .then((res) => {\\n        snackbar.message = \\\"Enregistré.\\\";\\n        snackbar.visible = true;\\n        snackbar.props.bg = \\\"#9fc\\\";\\n\\n        $films.currentFilmEditingStatus = film.editing_status;\\n\\n        // Met à jour la currentFilmsList avec les données à jour du film.\\n        $films.currentFilmsList = _($films.currentFilmsList)\\n          .map((d) => {\\n            if (d.pk === pk) {\\n              return _({})\\n                .assign(d, {\\n                  titre: film.titre,\\n                  art: film.art,\\n                  realisateurs: film.realisateurs,\\n                  annee: film.annee,\\n                  editing_status: film.editing_status,\\n                })\\n                .value();\\n            } else {\\n              return d;\\n            }\\n          })\\n          .value();\\n      })\\n      .catch((e) => {\\n        console.log(e);\\n        snackbar.message = \\\"L'enregistrement a échoué.\\\";\\n        snackbar.props.bg = \\\"#f99\\\";\\n        snackbar.visible = true;\\n      });\\n  }\\n\\n  function cleanUp(e) {\\n    // 2022-11-10 : un timeout est nécessaire lorsque l'événement est de type `paste`.\\n    setTimeout(() => {\\n      e.target.value = cudm(e.target.value);\\n    }, 1);\\n  }\\n\\n  function cleanUpSingleLine(e) {\\n    setTimeout(() => {\\n      e.target.value = cudm(e.target.value, { singleLine: true });\\n    }, 1);\\n  }\\n</script>\\n\\n{#if pk}\\n  {#await film then film}\\n    <div class=\\\"container\\\">\\n      <Form submit={updateFilm} options={{ textareaFitContent: true }}>\\n        <div>\\n          <span\\n            on:keyup={(e) => {}}\\n            class=\\\"clip\\\"\\n            title=\\\"Copier dans le presse-papier\\\"\\n            on:click={async () => {\\n              await navigator.clipboard.writeText(film.pk);\\n            }}>{film.pk}</span\\n          >\\n          <div class=\\\"status-container\\\">\\n            <EditingStatus status={$films.currentFilmEditingStatus} size={12} />\\n            {[\\\"Non relu\\\", \\\"En cours\\\", \\\"Corrigé\\\"][\\n              $films.currentFilmEditingStatus\\n            ]}\\n          </div>\\n          <a\\n            class=\\\"small-link\\\"\\n            title=\\\"Voir la page du film sur le site\\\"\\n            href=\\\"https://www.cinematheque.fr/film/{film.pk}.html\\\"\\n            target=\\\"film_site_cf\\\">Site CF</a\\n          >\\n          <a\\n            class=\\\"small-link\\\"\\n            title=\\\"Rechercher le film sur Google\\\"\\n            href=\\\"https://www.google.com/search?q={film.titrevo ||\\n              film.titre} {film.realisateurs} site:en.wikipedia.org\\\"\\n            target=\\\"film_site_cf\\\">Google</a\\n          >\\n        </div>\\n        <fieldset>\\n          <label\\n            ><div>Titre</div>\\n            <input\\n              name=\\\"titre\\\"\\n              type=\\\"text\\\"\\n              class=\\\"bold\\\"\\n              value={film.titre || \\\"\\\"}\\n              required\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            /></label\\n          >\\n          <label style=\\\"flex: 0 1 10%;\\\"\\n            ><div>Art</div>\\n            <input\\n              name=\\\"art\\\"\\n              type=\\\"text\\\"\\n              class=\\\"bold\\\"\\n              value={film.art || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            /></label\\n          >\\n        </fieldset>\\n        <fieldset>\\n          <label\\n            ><div>TitreVo</div>\\n            <input\\n              name=\\\"titrevo\\\"\\n              type=\\\"text\\\"\\n              value={film.titrevo || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            /></label\\n          >\\n          <label style=\\\"flex: 0 1 10%;\\\"\\n            ><div>ArtVo</div>\\n            <input\\n              name=\\\"artvo\\\"\\n              type=\\\"text\\\"\\n              value={film.artvo || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            /></label\\n          >\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>TitreNx</div>\\n            <input\\n              name=\\\"titrenx\\\"\\n              type=\\\"text\\\"\\n              value={film.titrenx || \\\"\\\"}\\n            /></label\\n          >\\n        </fieldset>\\n        <fieldset>\\n          <label\\n            ><div>Réalisateurs</div>\\n            <input\\n              name=\\\"realisateurs\\\"\\n              type=\\\"text\\\"\\n              value={film.realisateurs || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n              required\\n            /></label\\n          >\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>Pays</div>\\n            <input\\n              name=\\\"pays\\\"\\n              type=\\\"text\\\"\\n              value={film.pays || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            />\\n          </label>\\n          <label style=\\\"flex: 0 1 15%;\\\">\\n            <div>Année</div>\\n            <input\\n              name=\\\"annee\\\"\\n              type=\\\"text\\\"\\n              value={film.annee || \\\"\\\"}\\n              required\\n              pattern=\\\"\\\\d\\\\d\\\\d\\\\d\\\"\\n              readonly={film.annee && film.annee_is_verified}\\n              tabindex={film.annee && film.annee_is_verified ? \\\"-1\\\" : \\\"auto\\\"}\\n            />\\n          </label>\\n          <label style=\\\"flex: 0 1 15%;\\\">\\n            <div>Durée</div>\\n            <input name=\\\"duree\\\" type=\\\"text\\\" value={film.duree || \\\"\\\"} />\\n          </label>\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>Générique (+ Générique prog)</div>\\n            <input\\n              name=\\\"generique\\\"\\n              type=\\\"text\\\"\\n              value={film.generique || \\\"\\\"}\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}\\n            />\\n          </label>\\n        </fieldset>\\n        <!-- {#if film.generique !== film.generique_source} -->\\n        <fieldset target=\\\"\\\">\\n          <label>\\n            <input\\n              style=\\\"background-color: #ccc; color:#444;\\\"\\n              type=\\\"text\\\"\\n              disabled\\n              value={film.generique_source || \\\"\\\"}\\n            /></label\\n          >\\n        </fieldset>\\n        <!-- {/if} -->\\n        <fieldset>\\n          <label>\\n            <div>Adaptation</div>\\n            <textarea\\n              name=\\\"adaptation\\\"\\n              class=\\\"single-line\\\"\\n              on:blur={cleanUpSingleLine}\\n              on:paste={cleanUpSingleLine}>{film.adaptation || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n\\n        <fieldset>\\n          <label>\\n            <div>Synopsis</div>\\n            <textarea name=\\\"synopsis\\\" on:blur={cleanUp} on:paste={cleanUp}\\n              >{film.synopsis || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>\\n              Mini-texte (remplace les synopsis dans la nouvelle formule du\\n              programme papier)\\n            </div>\\n            <textarea\\n              class=\\\"hi\\\"\\n              name=\\\"minitexte\\\"\\n              on:blur={cleanUp}\\n              on:paste={cleanUp}>{film.minitexte || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>Commentaire (texte FIFR, citation)</div>\\n            <textarea name=\\\"commentaire\\\" on:blur={cleanUp} on:paste={cleanUp}\\n              >{film.commentaire || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>Mentions (restauration, ...)</div>\\n            <textarea name=\\\"mentions\\\" on:blur={cleanUp} on:paste={cleanUp}\\n              >{film.mentions || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n        <fieldset>\\n          <label>\\n            <div>Synopsis JP</div>\\n            <textarea name=\\\"synopsisjp\\\" on:blur={cleanUp} on:paste={cleanUp}\\n              >{film.synopsisjp || \\\"\\\"}</textarea\\n            >\\n          </label>\\n        </fieldset>\\n\\n        <!-- <input name=\\\"ageminimal\\\" type=\\\"hidden\\\" value={film.ageminimal || null} /> -->\\n\\n        <fieldset>\\n          <label style=\\\"flex: 0 1 20%;\\\"\\n            ><div>Editing_status</div>\\n            <select name=\\\"editing_status\\\" required>\\n              <option value=\\\"0\\\" selected={film.editing_status === 0}\\n                >0-Non relu</option\\n              >\\n              <option value=\\\"1\\\" selected={film.editing_status === 1}\\n                >1-En cours</option\\n              >\\n              <option value=\\\"2\\\" selected={film.editing_status === 2}\\n                >2-Corrigé</option\\n              >\\n            </select></label\\n          >\\n          <div style=\\\"flex: 0 0 50%;\\\" />\\n\\n          <label style=\\\"flex: 0 1 15%;\\\">\\n            <div>\\n              Id Allociné\\n              {#if !film.id_boxoffice}<a\\n                  href=\\\"https://www.allocine.fr/rechercher/movie/?q={film.titre}\\\"\\n                  target=\\\"allocine\\\">⚫︎</a\\n                >{:else}<a\\n                  class=\\\"check\\\"\\n                  href=\\\"https://www.allocine.fr/film/fichefilm_gen_cfilm={film.id_boxoffice}.html\\\"\\n                  target=\\\"allocine\\\">⚫︎</a\\n                >{/if}\\n            </div>\\n            <input\\n              name=\\\"id_boxoffice\\\"\\n              type=\\\"text\\\"\\n              value={film.id_boxoffice || \\\"\\\"}\\n              pattern=\\\"\\\\d+\\\"\\n            />\\n          </label>\\n\\n          <label style=\\\"flex: 0 1 15%;\\\"\\n            ><div>Âge JP</div>\\n            <select name=\\\"ageminimal\\\">\\n              <option value=\\\"\\\" />\\n              {#each [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as age}\\n                <option value={age} selected={film.ageminimal === age}\\n                  >{age}</option\\n                >\\n              {/each}\\n            </select>\\n          </label>\\n        </fieldset>\\n        <fieldset class=\\\"buttons-container\\\">\\n          <label><input type=\\\"submit\\\" class=\\\"yes\\\" value=\\\"Enregistrer\\\" /></label>\\n        </fieldset>\\n      </Form>\\n    </div>\\n  {/await}\\n{/if}\\n<Snackbar bind:visible={snackbar.visible} {...snackbar.props}>\\n  {snackbar.message}\\n</Snackbar>\\n\\n<style>\\n  .container {\\n    margin: 12px auto;\\n    width: 100%;\\n    max-width: 600px;\\n    padding: 12px;\\n    flex: 0 0 auto;\\n    align-self: flex-start;\\n    background-color: #ddd;\\n  }\\n\\n  .status-container {\\n    display: inline-block;\\n    font-size: 0.75rem;\\n    padding: 0 2px 0 0;\\n    border: solid 1px #888;\\n    color: #666;\\n    border-radius: 4px;\\n    user-select: none;\\n  }\\n\\n  a {\\n    color: inherit;\\n    border: none;\\n    text-decoration: none;\\n    padding: 0;\\n    margin: 0;\\n    font-size: 1rem;\\n  }\\n\\n  .small-link {\\n    display: inline-block;\\n    font-size: 0.875rem;\\n    color: #666;\\n    padding: 0 2px;\\n    text-decoration: underline;\\n  }\\n\\n  .clip {\\n    display: inline-block;\\n    font-size: 1rem;\\n    color: #444;\\n    background-color: #ccc;\\n    padding: 0 4px;\\n    margin: 0 2px 0 0;\\n    cursor: copy;\\n  }\\n\\n  label a {\\n    font-size: inherit;\\n    padding: 0 0 0 4px;\\n  }\\n\\n  label a.check {\\n    color: #69f;\\n  }\\n\\n  .hi {\\n    background-color: #cfe;\\n  }\\n\\n  input:disabled {\\n    background-color: transparent;\\n  }\\n\\n  input:read-only {\\n    background-color: #ccc;\\n    color: #444;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA+XE,UAAU,8BAAC,CAAC,AACV,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,UAAU,CACtB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,iBAAiB,8BAAC,CAAC,AACjB,OAAO,CAAE,YAAY,CACrB,SAAS,CAAE,OAAO,CAClB,OAAO,CAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAClB,MAAM,CAAE,KAAK,CAAC,GAAG,CAAC,IAAI,CACtB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,CAAC,8BAAC,CAAC,AACD,KAAK,CAAE,OAAO,CACd,MAAM,CAAE,IAAI,CACZ,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,YAAY,CACrB,SAAS,CAAE,QAAQ,CACnB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,CAAC,CAAC,GAAG,CACd,eAAe,CAAE,SAAS,AAC5B,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,YAAY,CACrB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,IAAI,CACtB,OAAO,CAAE,CAAC,CAAC,GAAG,CACd,MAAM,CAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CACjB,MAAM,CAAE,IAAI,AACd,CAAC,AAED,oBAAK,CAAC,CAAC,eAAC,CAAC,AACP,SAAS,CAAE,OAAO,CAClB,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,AACpB,CAAC,AAED,oBAAK,CAAC,CAAC,MAAM,eAAC,CAAC,AACb,KAAK,CAAE,IAAI,AACb,CAAC,AAED,GAAG,8BAAC,CAAC,AACH,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,mCAAK,SAAS,AAAC,CAAC,AACd,gBAAgB,CAAE,WAAW,AAC/B,CAAC,AAED,mCAAK,UAAU,AAAC,CAAC,AACf,gBAAgB,CAAE,IAAI,CACtB,KAAK,CAAE,IAAI,AACb,CAAC\"}"
};

const FilmEdit = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $films, $$unsubscribe_films;
	$$unsubscribe_films = subscribe(films, value => $films = value);
	let oldPk;
	let pk;
	let film;

	let snackbar = {
		visible: false,
		message: "",
		props: {}, // bottom, bg, color, style, timeout
		
	};

	function updateFilm(e) {
		let formData = new FormData(e.target);
		let film = [];

		for (let [k, v] of formData.entries()) {
			film.push([k, v]);
		}

		film = Object.assign(___default["default"].fromPairs(film));

		film = convertObjectValuesToNum(film, ["annee", "duree", "editing_status", "ageminimal", "id_boxoffice"]); // <--- Ajout (2024-05-23)
		// Une chaîne vide (ageminimal non spécifié) renvoie 0.

		if (film.ageminimal === 0) film = ___default["default"].omit(film, "ageminimal");

		// 2024-05-22 : On retire les propriétés dont la valeur est une chaîne vide.
		film = ___default["default"](film).omitBy(v => v === "").value();

		// (NOTE du 2024-05-22) Une requête PUT (et non PATCH) aura pour effet que les champs non transmis (notamment les "" retirées ci-dessus) seront bien réécrits dans la table, avec la valeur par défaut du champ.
		put(`film/${pk}`, film).then(res => {
			snackbar.message = "Enregistré.";
			snackbar.visible = true;
			snackbar.props.bg = "#9fc";
			set_store_value(films, $films.currentFilmEditingStatus = film.editing_status, $films);

			// Met à jour la currentFilmsList avec les données à jour du film.
			set_store_value(
				films,
				$films.currentFilmsList = ___default["default"]($films.currentFilmsList).map(d => {
					if (d.pk === pk) {
						return ___default["default"]({}).assign(d, {
							titre: film.titre,
							art: film.art,
							realisateurs: film.realisateurs,
							annee: film.annee,
							editing_status: film.editing_status
						}).value();
					} else {
						return d;
					}
				}).value(),
				$films
			);
		}).catch(e => {
			console.log(e);
			snackbar.message = "L'enregistrement a échoué.";
			snackbar.props.bg = "#f99";
			snackbar.visible = true;
		});
	}

	$$result.css.add(css$9);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		{
			{
				// DONE: Empêche le rechargement intempestif du component quand on sélectionne un autre cycle.
				// TODO: Améliorer.
				oldPk = pk;

				pk = $films.currentFilmPk;

				if (pk && oldPk !== pk) {
					film = get(`film/${pk}`);

					film.then(f => {
						set_store_value(films, $films.currentFilmEditingStatus = f.editing_status, $films);
					});
				}
			}
		}

		$$rendered = `${pk
		? `${(function (__value) {
				if (is_promise(__value)) {
					__value.then(null, noop$1);
					return ``;
				}

				return (function (film) {
					return `
    <div class="${"container svelte-1odd7pr"}">${validate_component(Form, "Form").$$render(
						$$result,
						{
							submit: updateFilm,
							options: { textareaFitContent: true }
						},
						{},
						{
							default: () => {
								return `<div><span class="${"clip svelte-1odd7pr"}" title="${"Copier dans le presse-papier"}">${escape(film.pk)}</span>
          <div class="${"status-container svelte-1odd7pr"}">${validate_component(EditingStatus, "EditingStatus").$$render(
									$$result,
									{
										status: $films.currentFilmEditingStatus,
										size: 12
									},
									{},
									{}
								)}
            ${escape(["Non relu", "En cours", "Corrigé"][$films.currentFilmEditingStatus])}</div>
          <a class="${"small-link svelte-1odd7pr"}" title="${"Voir la page du film sur le site"}" href="${"https://www.cinematheque.fr/film/" + escape(film.pk, true) + ".html"}" target="${"film_site_cf"}">Site CF</a>
          <a class="${"small-link svelte-1odd7pr"}" title="${"Rechercher le film sur Google"}" href="${"https://www.google.com/search?q=" + escape(film.titrevo || film.titre, true) + " " + escape(film.realisateurs, true) + " site:en.wikipedia.org"}" target="${"film_site_cf"}">Google</a></div>
        <fieldset><label><div>Titre</div>
            <input name="${"titre"}" type="${"text"}" class="${"bold svelte-1odd7pr"}"${add_attribute("value", film.titre || "", 0)} required></label>
          <label style="${"flex: 0 1 10%;"}"><div>Art</div>
            <input name="${"art"}" type="${"text"}" class="${"bold svelte-1odd7pr"}"${add_attribute("value", film.art || "", 0)}></label></fieldset>
        <fieldset><label><div>TitreVo</div>
            <input name="${"titrevo"}" type="${"text"}"${add_attribute("value", film.titrevo || "", 0)} class="${"svelte-1odd7pr"}"></label>
          <label style="${"flex: 0 1 10%;"}"><div>ArtVo</div>
            <input name="${"artvo"}" type="${"text"}"${add_attribute("value", film.artvo || "", 0)} class="${"svelte-1odd7pr"}"></label></fieldset>
        <fieldset><label><div>TitreNx</div>
            <input name="${"titrenx"}" type="${"text"}"${add_attribute("value", film.titrenx || "", 0)} class="${"svelte-1odd7pr"}"></label></fieldset>
        <fieldset><label><div>Réalisateurs</div>
            <input name="${"realisateurs"}" type="${"text"}"${add_attribute("value", film.realisateurs || "", 0)} required class="${"svelte-1odd7pr"}"></label></fieldset>
        <fieldset><label><div>Pays</div>
            <input name="${"pays"}" type="${"text"}"${add_attribute("value", film.pays || "", 0)} class="${"svelte-1odd7pr"}"></label>
          <label style="${"flex: 0 1 15%;"}"><div>Année</div>
            <input name="${"annee"}" type="${"text"}"${add_attribute("value", film.annee || "", 0)} required pattern="${"\\d\\d\\d\\d"}" ${film.annee && film.annee_is_verified ? "readonly" : ""}${add_attribute("tabindex", film.annee && film.annee_is_verified ? "-1" : "auto", 0)} class="${"svelte-1odd7pr"}"></label>
          <label style="${"flex: 0 1 15%;"}"><div>Durée</div>
            <input name="${"duree"}" type="${"text"}"${add_attribute("value", film.duree || "", 0)} class="${"svelte-1odd7pr"}"></label></fieldset>
        <fieldset><label><div>Générique (+ Générique prog)</div>
            <input name="${"generique"}" type="${"text"}"${add_attribute("value", film.generique || "", 0)} class="${"svelte-1odd7pr"}"></label></fieldset>
        
        <fieldset target="${""}"><label><input style="${"background-color: #ccc; color:#444;"}" type="${"text"}" disabled${add_attribute("value", film.generique_source || "", 0)} class="${"svelte-1odd7pr"}"></label></fieldset>
        
        <fieldset><label><div>Adaptation</div>
            <textarea name="${"adaptation"}" class="${"single-line"}">${escape(film.adaptation || "", true)}</textarea></label></fieldset>

        <fieldset><label><div>Synopsis</div>
            <textarea name="${"synopsis"}">${escape(film.synopsis || "", true)}</textarea></label></fieldset>
        <fieldset><label><div>Mini-texte (remplace les synopsis dans la nouvelle formule du
              programme papier)
            </div>
            <textarea class="${"hi svelte-1odd7pr"}" name="${"minitexte"}">${escape(film.minitexte || "", true)}</textarea></label></fieldset>
        <fieldset><label><div>Commentaire (texte FIFR, citation)</div>
            <textarea name="${"commentaire"}">${escape(film.commentaire || "", true)}</textarea></label></fieldset>
        <fieldset><label><div>Mentions (restauration, ...)</div>
            <textarea name="${"mentions"}">${escape(film.mentions || "", true)}</textarea></label></fieldset>
        <fieldset><label><div>Synopsis JP</div>
            <textarea name="${"synopsisjp"}">${escape(film.synopsisjp || "", true)}</textarea></label></fieldset>

        

        <fieldset><label style="${"flex: 0 1 20%;"}"><div>Editing_status</div>
            <select name="${"editing_status"}" required><option value="${"0"}" ${film.editing_status === 0 ? "selected" : ""}>0-Non relu</option><option value="${"1"}" ${film.editing_status === 1 ? "selected" : ""}>1-En cours</option><option value="${"2"}" ${film.editing_status === 2 ? "selected" : ""}>2-Corrigé</option></select></label>
          <div style="${"flex: 0 0 50%;"}"></div>

          <label style="${"flex: 0 1 15%;"}" class="${"svelte-1odd7pr"}"><div>Id Allociné
              ${!film.id_boxoffice
								? `<a href="${"https://www.allocine.fr/rechercher/movie/?q=" + escape(film.titre, true)}" target="${"allocine"}" class="${"svelte-1odd7pr"}">⚫︎</a>`
								: `<a class="${"check svelte-1odd7pr"}" href="${"https://www.allocine.fr/film/fichefilm_gen_cfilm=" + escape(film.id_boxoffice, true) + ".html"}" target="${"allocine"}">⚫︎</a>`}</div>
            <input name="${"id_boxoffice"}" type="${"text"}"${add_attribute("value", film.id_boxoffice || "", 0)} pattern="${"\\d+"}" class="${"svelte-1odd7pr"}"></label>

          <label style="${"flex: 0 1 15%;"}"><div>Âge JP</div>
            <select name="${"ageminimal"}"><option value="${""}"></option>${each([3, 4, 5, 6, 7, 8, 9, 10, 11, 12], age => {
									return `<option${add_attribute("value", age, 0)} ${film.ageminimal === age ? "selected" : ""}>${escape(age)}</option>`;
								})}</select></label></fieldset>
        <fieldset class="${"buttons-container"}"><label><input type="${"submit"}" class="${"yes svelte-1odd7pr"}" value="${"Enregistrer"}"></label></fieldset>`;
							}
						}
					)}</div>
  `;
				})(__value);
			})(film)}`
		: ``}
${validate_component(Snackbar, "Snackbar").$$render(
			$$result,
			Object_1.assign(snackbar.props, { visible: snackbar.visible }),
			{
				visible: $$value => {
					snackbar.visible = $$value;
					$$settled = false;
				}
			},
			{
				default: () => {
					return `${escape(snackbar.message)}`;
				}
			}
		)}`;
	} while (!$$settled);

	$$unsubscribe_films();
	return $$rendered;
});

// src/local.ts
var storage = typeof window !== "undefined" ? window.localStorage : void 0;
var g = generator(storage);
var writable = g.writable;

const global$1 = writable("global", {
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

/* src\components\films\FilmsExportJsonNovius.svelte generated by Svelte v3.53.0 */

const css$8 = {
	code: "a.svelte-b5e9xv{display:none}",
	map: "{\"version\":3,\"file\":\"FilmsExportJsonNovius.svelte\",\"sources\":[\"FilmsExportJsonNovius.svelte\"],\"sourcesContent\":[\"<script>\\n  import _ from \\\"lodash\\\";\\n  import { marked } from \\\"marked\\\";\\n  import nbsp from \\\"../../lib/format/nbsp\\\";\\n  import { get } from \\\"../../lib/api.js\\\";\\n  import { films } from \\\"../../stores/films.js\\\";\\n  export let filename = \\\"films.json\\\";\\n\\n  let link;\\n\\n  function fetchFilms() {\\n    let pks = _($films.currentFilmsList)\\n      .map((d) => d.pk)\\n      .value()\\n      .join(\\\",\\\");\\n\\n    get(`films?pk=${pks}`).then((data) => {\\n      let films = convertFilmsToNoviusFormat(data.data);\\n\\n      // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file\\n      link.setAttribute(\\n        \\\"href\\\",\\n        `data:application/json;charset=utf-8,${encodeURIComponent(\\n          JSON.stringify(films, null, 2)\\n        )}`\\n      );\\n      link.setAttribute(\\\"download\\\", filename);\\n      link.click();\\n    });\\n  }\\n\\n  function convertFilmsToNoviusFormat(data) {\\n    let o = _(data)\\n      // .filter((d) => d.editing_status === 2) // On ne garde que les films en état validé.\\n      .map((d) => {\\n        let synopsis = d.synopsis || undefined;\\n        let minitexte = d.minitexte || undefined;\\n        let commentaire = d.commentaire || undefined;\\n        let mentions = d.mentions || undefined;\\n        let synopsisjp = d.synopsisjp || undefined;\\n        let ageMinimal =\\n          d.ageMininal === 0 ? undefined : d.ageMinimal || undefined;\\n\\n        return {\\n          pk: d.pk,\\n          titre: d.titre,\\n          article: d.art || \\\"\\\",\\n          titreVoComplet: [\\n            (!d.artvo\\n              ? d.titrevo\\n              : d.artvo === \\\"L'\\\"\\n                ? `${d.artvo}${d.titrevo}`\\n                : `${d.artvo} ${d.titrevo}`) || \\\"\\\",\\n            d.titrenx ? ` [${d.titrenx}]` : \\\"\\\",\\n          ].join(\\\"\\\"),\\n          realisateur: d.realisateurs,\\n          pays: d.pays,\\n          annee: Number(d.annee) || null,\\n          duree: Number(d.duree) || null,\\n          generique: d.generique ? `<p>Avec ${d.generique}.</p>` : \\\"\\\",\\n          adaptation: toHTML(d.adaptation, true),\\n          synopsis: toHTML(minitexte || synopsis || synopsisjp), // Ordre de priorité des textes à mettre dans le champ \\\"synopsis\\\" du site (qui sert de champ texte principal).\\n          texte: toHTML(commentaire),\\n          mention: toHTML(mentions),\\n          ageMinimal,\\n        };\\n      })\\n      .value();\\n\\n    // Elimine les propriétés de certains champs si leur valeur est null, undefined, \\\"\\\" ou 0 (= actuellement la valeur vide pour âge minimal).\\n    // Ce mécanisme permet de préserver leur éventuelle valeur déjà existante sur le site.\\n    o = _(o)\\n      .map((d) =>\\n        _(d)\\n          .omitBy((v, k) => {\\n            if (\\n              _.indexOf(\\n                [\\\"duree\\\", \\\"ageMinimal\\\"],\\n                // [\\\"synopsis\\\", \\\"texte\\\", \\\"mention\\\", \\\"duree\\\", \\\"ageMinimal\\\"],\\n                k\\n              ) > -1 &&\\n              (v === \\\"\\\" || _.isNil(v) || v === 0)\\n            ) {\\n              return true;\\n            }\\n            return false;\\n          })\\n          .value()\\n      )\\n      .value();\\n\\n    return o;\\n  }\\n\\n  function toHTML(s, inline = false) {\\n    // Convertit Markdown -> HTML\\n    // L'option inline=true renvoie du HTML inline (sans <p></p> autour). Utile pour le champ adaptation.\\n    if (!s || s === \\\"\\\") return \\\"\\\";\\n    const html = inline ? marked.parseInline : marked.parse;\\n\\n    let o = html(s); // Conversion Markdown -> HTML.\\n    o = o.replace(/&#39;/g, \\\"'\\\"); // Remplacement de l'entité apostrophe &#39; (générée par marked) par son caractère.\\n    o = o.replace(/\\\\n/g, \\\"\\\"); // Remplace de \\\\n généré par marked.\\n    o = o.replace(/<hr>/g, `<hr class=\\\"short\\\">`); // Donne la classe voulue à l'élément hr.\\n    o = nbsp(o); // Placement des espaces insécables.\\n    return o;\\n  }\\n</script>\\n\\n<button class=\\\"mini\\\" on:click={fetchFilms}>Export Novius</button>\\n<a bind:this={link} href=\\\"/\\\">Lien</a>\\n\\n<style>\\n  a {\\n    display: none;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAiHE,CAAC,cAAC,CAAC,AACD,OAAO,CAAE,IAAI,AACf,CAAC\"}"
};

const FilmsExportJsonNovius = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$unsubscribe_films;
	$$unsubscribe_films = subscribe(films, value => value);
	let { filename = "films.json" } = $$props;
	let link;

	if ($$props.filename === void 0 && $$bindings.filename && filename !== void 0) $$bindings.filename(filename);
	$$result.css.add(css$8);
	$$unsubscribe_films();

	return `<button class="${"mini"}">Export Novius</button>
<a href="${"/"}" class="${"svelte-b5e9xv"}"${add_attribute("this", link, 0)}>Lien</a>`;
});

/* src\components\ui\XButton.svelte generated by Svelte v3.53.0 */

const css$7 = {
	code: "button.svelte-1ftpx2m{padding:0;margin:0;display:inline-block;background-color:transparent;border-radius:0;text-align:center;cursor:pointer}",
	map: "{\"version\":3,\"file\":\"XButton.svelte\",\"sources\":[\"XButton.svelte\"],\"sourcesContent\":[\"<script>\\n  import { createEventDispatcher } from \\\"svelte\\\";\\n  const dispatch = createEventDispatcher();\\n  export let style = \\\"\\\";\\n</script>\\n\\n<button {style} on:click={() => dispatch(\\\"click\\\")}><slot /></button>\\n\\n<style>\\n  button {\\n    padding: 0;\\n    margin: 0;\\n    display: inline-block;\\n    background-color: transparent;\\n    border-radius: 0;\\n    text-align: center;\\n    cursor: pointer;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AASE,MAAM,eAAC,CAAC,AACN,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,YAAY,CACrB,gBAAgB,CAAE,WAAW,CAC7B,aAAa,CAAE,CAAC,CAChB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,OAAO,AACjB,CAAC\"}"
};

const XButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	createEventDispatcher();
	let { style = "" } = $$props;
	if ($$props.style === void 0 && $$bindings.style && style !== void 0) $$bindings.style(style);
	$$result.css.add(css$7);
	return `<button${add_attribute("style", style, 0)} class="${"svelte-1ftpx2m"}">${slots.default ? slots.default({}) : ``}</button>`;
});

/* src\components\films\FilmsNav.svelte generated by Svelte v3.53.0 */

const css$6 = {
	code: ".container.svelte-1g8yw5x{position:relative;display:flex;flex-wrap:nowrap;align-items:stretch;flex-direction:column;flex:0 0 100%;overflow:hidden;background-color:#aaa}.cycle-selector.svelte-1g8yw5x{padding:8px 4px 0 4px}.films-count.svelte-1g8yw5x{padding:3px 16px 12px 16px;flex:0 0 auto;overflow:hidden;font-size:0.813rem;text-align:right}ul.svelte-1g8yw5x{padding:0 4px;overflow-y:auto}li.svelte-1g8yw5x{background-color:#ddd;padding:4px 2px 4px 12px;font-size:0.913rem;overflow:hidden;line-height:1.3;cursor:pointer}li.selected.svelte-1g8yw5x,li.selected.svelte-1g8yw5x:nth-child(even){background-color:#ffa}li.selected.svelte-1g8yw5x:focus,li.selected.svelte-1g8yw5x:nth-child(even):focus{background-color:#ff6}li.svelte-1g8yw5x:nth-child(even){background-color:#ccc}li.svelte-1g8yw5x:not(.selected):hover{background-color:#eee}.title-container.svelte-1g8yw5x{display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;align-items:center}.title.svelte-1g8yw5x{flex:0 1 auto;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#018}.editing-status.svelte-1g8yw5x{flex:0 0 auto;align-self:auto;padding-left:2px}.director.svelte-1g8yw5x{overflow:hidden;color:#666;font-size:0.813rem;white-space:nowrap;text-overflow:ellipsis}.footer.svelte-1g8yw5x{padding:6px 0}.tools-container.svelte-1g8yw5x{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;margin:0 7px 0 4px}.tools-container-left.svelte-1g8yw5x,.tools-container-right.svelte-1g8yw5x{flex:1 1 auto}label.svelte-1g8yw5x{padding:12px}",
	map: "{\"version\":3,\"file\":\"FilmsNav.svelte\",\"sources\":[\"FilmsNav.svelte\"],\"sourcesContent\":[\"<script>\\r\\n  import _ from \\\"lodash\\\";\\r\\n  import { get } from \\\"../../lib/api.js\\\";\\r\\n  import { films } from \\\"../../stores/films\\\";\\r\\n  import { global } from \\\"../../stores/global\\\";\\r\\n  import EditingStatus from \\\"../EditingStatus.svelte\\\";\\r\\n  import Form from \\\"../lib/Form.svelte\\\";\\r\\n  import FilmsExportJson from \\\"./FilmsExportJson.svelte\\\";\\r\\n  import FilmsExportJsonNovius from \\\"./FilmsExportJsonNovius.svelte\\\";\\r\\n  import XButton from \\\"../ui/XButton.svelte\\\";\\r\\n  import Refresh from \\\"../icons/Refresh.svelte\\\";\\r\\n\\r\\n  // if (!$global.currentProgId) $global.currentProgId = 129; // TODO: fetch \\\"default\\\" currentProgId\\r\\n\\r\\n  let cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);\\r\\n\\r\\n  let elCycleSelector;\\r\\n\\r\\n  // 2022-12-16 : Quand le programme change, réinitialise le sélecteur de cycles et la liste des films (solution rapide mais pas propre).\\r\\n  $: {\\r\\n    $global;\\r\\n    cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);\\r\\n    if (elCycleSelector) {\\r\\n      elCycleSelector.selectedIndex = 0;\\r\\n      idCycle = null;\\r\\n      $films.currentFilmsList = [];\\r\\n    }\\r\\n  }\\r\\n\\r\\n  let idCycle;\\r\\n  let pWhenFilmsFetched; // Promesse (sans valeur de résolution) qui est tenue quand la liste des films est obtenue.\\r\\n\\r\\n  /**\\r\\n   * fetchFilmsList\\r\\n   * Requête la liste des films d'un cycle.\\r\\n   * Le cycle est identifié par idCycle, soit directement, soit via un événement.\\r\\n   * @param arg {number|Object} idCycle ou event.\\r\\n   */\\r\\n  function fetchFilmsList(arg) {\\r\\n    if (typeof arg === \\\"number\\\") {\\r\\n      idCycle = arg;\\r\\n    } else {\\r\\n      idCycle = Number(arg.currentTarget.value);\\r\\n    }\\r\\n    pWhenFilmsFetched = new Promise((resolve, reject) => {\\r\\n      get(`prog/${$global.currentProgId}/cycle/${idCycle}/films`)\\r\\n        .then((data) => {\\r\\n          $films.currentFilmsList = _(data.data)\\r\\n            .orderBy((d) => _.kebabCase(d.titre))\\r\\n            .value();\\r\\n          resolve();\\r\\n        })\\r\\n        .catch((e) => {\\r\\n          reject(e);\\r\\n        });\\r\\n    });\\r\\n  }\\r\\n\\r\\n  function selectFilm(e) {\\r\\n    $films.currentFilmPk = Number(e.currentTarget.dataset.pk);\\r\\n  }\\r\\n\\r\\n  function refresh(e) {\\r\\n    fetchFilmsList(idCycle);\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<div class=\\\"container\\\">\\r\\n  <div class=\\\"cycle-selector\\\">\\r\\n    <Form>\\r\\n      <fieldset>\\r\\n        <label>\\r\\n          <select\\r\\n            on:change|preventDefault={fetchFilmsList}\\r\\n            bind:this={elCycleSelector}\\r\\n          >\\r\\n            <option selected disabled value=\\\"\\\">--- Choisir un cycle ---</option>\\r\\n            {#await cyclesResponse then cycles}\\r\\n              {#each cycles.data as cycle}\\r\\n                <option value={cycle.id_cycle}>\\r\\n                  {cycle.id_cycle}\\r\\n                  -\\r\\n                  {cycle.titre_cycle}\\r\\n                </option>\\r\\n              {/each}\\r\\n            {:catch}\\r\\n              Erreur\\r\\n            {/await}\\r\\n          </select></label\\r\\n        >\\r\\n      </fieldset>\\r\\n    </Form>\\r\\n  </div>\\r\\n\\r\\n  <div class=\\\"tools-container\\\">\\r\\n    <div class=\\\"tools-container-left\\\">\\r\\n      <XButton\\r\\n        style=\\\"font-size:.75rem;\\\"\\r\\n        on:click={() => {\\r\\n          $global.filmEditOrView = \\\"view\\\";\\r\\n        }}>view</XButton\\r\\n      >\\r\\n      <XButton\\r\\n        style=\\\"font-size:.75rem;\\\"\\r\\n        on:click={() => {\\r\\n          $global.filmEditOrView = \\\"edit\\\";\\r\\n        }}>edit</XButton\\r\\n      >\\r\\n    </div>\\r\\n\\r\\n    <div class=\\\"tools-container-right\\\">\\r\\n      <div class=\\\"films-count\\\">\\r\\n        {#if idCycle}\\r\\n          {#await pWhenFilmsFetched then}\\r\\n            {$films.currentFilmsList.length}\\r\\n            {$films.currentFilmsList.length < 2\\r\\n              ? \\\"film trouvé.\\\"\\r\\n              : \\\"films trouvés.\\\"}\\r\\n            <XButton on:click={refresh}\\r\\n              ><Refresh size={14} color={\\\"#666\\\"} /></XButton\\r\\n            >\\r\\n          {/await}{/if}\\r\\n      </div>\\r\\n    </div>\\r\\n  </div>\\r\\n\\r\\n  {#await pWhenFilmsFetched then}\\r\\n    {#if $films.currentFilmsList.length > 0}\\r\\n      <ul class=\\\"films-list\\\">\\r\\n        {#each $films.currentFilmsList as film, i}\\r\\n          <li\\r\\n            on:focus={selectFilm}\\r\\n            on:click={selectFilm}\\r\\n            data-pk={film.pk}\\r\\n            title={film.pk}\\r\\n            class:selected={film.pk === $films.currentFilmPk}\\r\\n            tabindex={i + 1}\\r\\n          >\\r\\n            <div class=\\\"title-container\\\">\\r\\n              <div class=\\\"title\\\">\\r\\n                {film.titre}\\r\\n                {film.art ? `(${film.art})` : \\\"\\\"}\\r\\n              </div>\\r\\n              <div class=\\\"editing-status\\\">\\r\\n                <EditingStatus status={film.editing_status} />\\r\\n              </div>\\r\\n            </div>\\r\\n            <div class=\\\"director\\\">{film.realisateurs}, {film.annee}</div>\\r\\n          </li>\\r\\n        {/each}\\r\\n      </ul>\\r\\n      <div class=\\\"footer\\\">\\r\\n        <!-- <FilmsExportJson /> -->\\r\\n        <FilmsExportJsonNovius\\r\\n          filename=\\\"PROG{$global.currentProgId}_CYCL{idCycle}_FILMS_NOVIUS.json\\\"\\r\\n        />\\r\\n      </div>\\r\\n    {/if}\\r\\n  {:catch error}\\r\\n    <p>{error.message}</p>\\r\\n  {/await}\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .container {\\r\\n    position: relative;\\r\\n    display: flex;\\r\\n    flex-wrap: nowrap;\\r\\n    align-items: stretch;\\r\\n    flex-direction: column;\\r\\n    flex: 0 0 100%;\\r\\n    overflow: hidden;\\r\\n    background-color: #aaa;\\r\\n  }\\r\\n\\r\\n  .cycle-selector {\\r\\n    padding: 8px 4px 0 4px;\\r\\n  }\\r\\n\\r\\n  .films-count {\\r\\n    /* height: 32px; */\\r\\n    padding: 3px 16px 12px 16px;\\r\\n    flex: 0 0 auto;\\r\\n    overflow: hidden;\\r\\n    font-size: 0.813rem;\\r\\n    text-align: right;\\r\\n  }\\r\\n\\r\\n  ul {\\r\\n    padding: 0 4px;\\r\\n    overflow-y: auto;\\r\\n  }\\r\\n\\r\\n  li {\\r\\n    background-color: #ddd;\\r\\n    padding: 4px 2px 4px 12px;\\r\\n    font-size: 0.913rem;\\r\\n    overflow: hidden;\\r\\n    line-height: 1.3;\\r\\n    cursor: pointer;\\r\\n  }\\r\\n\\r\\n  li.selected,\\r\\n  li.selected:nth-child(even) {\\r\\n    background-color: #ffa;\\r\\n  }\\r\\n\\r\\n  li.selected:focus,\\r\\n  li.selected:nth-child(even):focus {\\r\\n    background-color: #ff6;\\r\\n  }\\r\\n\\r\\n  li:nth-child(even) {\\r\\n    background-color: #ccc;\\r\\n  }\\r\\n\\r\\n  li:not(.selected):hover {\\r\\n    background-color: #eee;\\r\\n  }\\r\\n\\r\\n  .title-container {\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    justify-content: flex-start;\\r\\n    align-items: center;\\r\\n  }\\r\\n\\r\\n  .title {\\r\\n    flex: 0 1 auto;\\r\\n    overflow: hidden;\\r\\n    white-space: nowrap;\\r\\n    text-overflow: ellipsis;\\r\\n    color: #018;\\r\\n  }\\r\\n\\r\\n  .editing-status {\\r\\n    flex: 0 0 auto;\\r\\n    align-self: auto;\\r\\n    padding-left: 2px;\\r\\n  }\\r\\n\\r\\n  .director {\\r\\n    overflow: hidden;\\r\\n    color: #666;\\r\\n    font-size: 0.813rem;\\r\\n    white-space: nowrap;\\r\\n    text-overflow: ellipsis;\\r\\n  }\\r\\n\\r\\n  .footer {\\r\\n    padding: 6px 0;\\r\\n  }\\r\\n\\r\\n  .tools-container {\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    align-items: center;\\r\\n    margin: 0 7px 0 4px;\\r\\n  }\\r\\n\\r\\n  .tools-container-left,\\r\\n  .tools-container-right {\\r\\n    flex: 1 1 auto;\\r\\n  }\\r\\n\\r\\n  label {\\r\\n    padding: 12px;\\r\\n  }\\r\\n</style>\\r\\n\"],\"names\":[],\"mappings\":\"AAoKE,UAAU,eAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,OAAO,CACpB,cAAc,CAAE,MAAM,CACtB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,QAAQ,CAAE,MAAM,CAChB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,eAAe,eAAC,CAAC,AACf,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,GAAG,AACxB,CAAC,AAED,YAAY,eAAC,CAAC,AAEZ,OAAO,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CAC3B,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,QAAQ,CAAE,MAAM,CAChB,SAAS,CAAE,QAAQ,CACnB,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,EAAE,eAAC,CAAC,AACF,OAAO,CAAE,CAAC,CAAC,GAAG,CACd,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,EAAE,eAAC,CAAC,AACF,gBAAgB,CAAE,IAAI,CACtB,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CACzB,SAAS,CAAE,QAAQ,CACnB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,OAAO,AACjB,CAAC,AAED,EAAE,wBAAS,CACX,EAAE,wBAAS,WAAW,IAAI,CAAC,AAAC,CAAC,AAC3B,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,EAAE,wBAAS,MAAM,CACjB,EAAE,wBAAS,WAAW,IAAI,CAAC,MAAM,AAAC,CAAC,AACjC,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,iBAAE,WAAW,IAAI,CAAC,AAAC,CAAC,AAClB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,iBAAE,KAAK,SAAS,CAAC,MAAM,AAAC,CAAC,AACvB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,gBAAgB,eAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,UAAU,CAC3B,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,MAAM,eAAC,CAAC,AACN,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,QAAQ,CACvB,KAAK,CAAE,IAAI,AACb,CAAC,AAED,eAAe,eAAC,CAAC,AACf,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,IAAI,CAChB,YAAY,CAAE,GAAG,AACnB,CAAC,AAED,SAAS,eAAC,CAAC,AACT,QAAQ,CAAE,MAAM,CAChB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,QAAQ,CACnB,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,QAAQ,AACzB,CAAC,AAED,OAAO,eAAC,CAAC,AACP,OAAO,CAAE,GAAG,CAAC,CAAC,AAChB,CAAC,AAED,gBAAgB,eAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,GAAG,AACrB,CAAC,AAED,oCAAqB,CACrB,sBAAsB,eAAC,CAAC,AACtB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,AAChB,CAAC,AAED,KAAK,eAAC,CAAC,AACL,OAAO,CAAE,IAAI,AACf,CAAC\"}"
};

const FilmsNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $films, $$unsubscribe_films;
	let $global, $$unsubscribe_global;
	$$unsubscribe_films = subscribe(films, value => $films = value);
	$$unsubscribe_global = subscribe(global$1, value => $global = value);

	// if (!$global.currentProgId) $global.currentProgId = 129; // TODO: fetch "default" currentProgId
	let cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);

	let elCycleSelector;
	let idCycle;
	let pWhenFilmsFetched; // Promesse (sans valeur de résolution) qui est tenue quand la liste des films est obtenue.

	$$result.css.add(css$6);

	{
		{
			cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);
		}
	}

	$$unsubscribe_films();
	$$unsubscribe_global();

	return `<div class="${"container svelte-1g8yw5x"}"><div class="${"cycle-selector svelte-1g8yw5x"}">${validate_component(Form, "Form").$$render($$result, {}, {}, {
		default: () => {
			return `<fieldset><label class="${"svelte-1g8yw5x"}"><select${add_attribute("this", elCycleSelector, 0)}><option selected disabled value="${""}">--- Choisir un cycle ---</option>${(function (__value) {
				if (is_promise(__value)) {
					__value.then(null, noop$1);
					return ``;
				}

				return (function (cycles) {
					return `
              ${each(cycles.data, cycle => {
						return `<option${add_attribute("value", cycle.id_cycle, 0)}>${escape(cycle.id_cycle)}
                  -
                  ${escape(cycle.titre_cycle)}
                </option>`;
					})}
            `;
				})(__value);
			})(cyclesResponse)}</select></label></fieldset>`;
		}
	})}</div>

  <div class="${"tools-container svelte-1g8yw5x"}"><div class="${"tools-container-left svelte-1g8yw5x"}">${validate_component(XButton, "XButton").$$render($$result, { style: "font-size:.75rem;" }, {}, {
		default: () => {
			return `view`;
		}
	})}
      ${validate_component(XButton, "XButton").$$render($$result, { style: "font-size:.75rem;" }, {}, {
		default: () => {
			return `edit`;
		}
	})}</div>

    <div class="${"tools-container-right svelte-1g8yw5x"}"><div class="${"films-count svelte-1g8yw5x"}">${``}</div></div></div>

  ${(function (__value) {
		if (is_promise(__value)) {
			__value.then(null, noop$1);
			return ``;
		}

		return (function () {
			return `
    ${$films.currentFilmsList.length > 0
			? `<ul class="${"films-list svelte-1g8yw5x"}">${each($films.currentFilmsList, (film, i) => {
					return `<li${add_attribute("data-pk", film.pk, 0)}${add_attribute("title", film.pk, 0)}${add_attribute("tabindex", i + 1, 0)} class="${["svelte-1g8yw5x", film.pk === $films.currentFilmPk ? "selected" : ""].join(' ').trim()}"><div class="${"title-container svelte-1g8yw5x"}"><div class="${"title svelte-1g8yw5x"}">${escape(film.titre)}
                ${escape(film.art ? `(${film.art})` : "")}</div>
              <div class="${"editing-status svelte-1g8yw5x"}">${validate_component(EditingStatus, "EditingStatus").$$render($$result, { status: film.editing_status }, {}, {})}
              </div></div>
            <div class="${"director svelte-1g8yw5x"}">${escape(film.realisateurs)}, ${escape(film.annee)}</div>
          </li>`;
				})}</ul>
      <div class="${"footer svelte-1g8yw5x"}">
        ${validate_component(FilmsExportJsonNovius, "FilmsExportJsonNovius").$$render(
					$$result,
					{
						filename: "PROG" + $global.currentProgId + "_CYCL" + idCycle + "_FILMS_NOVIUS.json"
					},
					{},
					{}
				)}</div>`
			: ``}
  `;
		})();
	})(pWhenFilmsFetched)}
</div>`;
});

/* src\routes\films.svelte generated by Svelte v3.53.0 */

const css$5 = {
	code: ".container.svelte-1h2l22k{display:flex;flex:0 0 100%;flex-direction:row;flex-wrap:nowrap;align-items:stretch}",
	map: "{\"version\":3,\"file\":\"films.svelte\",\"sources\":[\"films.svelte\"],\"sourcesContent\":[\"<script>\\n  import SplitPane from \\\"../components/ui/SplitPane.svelte\\\";\\n  import FilmView from \\\"../components/films/FilmView.svelte\\\";\\n  import FilmEdit from \\\"../components/films/FilmEdit.svelte\\\";\\n  import FilmsNav from \\\"../components/films/FilmsNav.svelte\\\";\\n  import { global } from \\\"../stores/global\\\";\\n</script>\\n\\n<svelte:head><title>Captiva - Films</title></svelte:head>\\n\\n<div class=\\\"container\\\">\\n  <SplitPane leftInitialSize=\\\"25%\\\">\\n    <svelte:fragment slot=\\\"left\\\">\\n      <FilmsNav />\\n    </svelte:fragment>\\n    <svelte:fragment slot=\\\"right\\\">\\n      {#if $global.filmEditOrView === \\\"edit\\\"}\\n        <FilmEdit />{:else}<FilmView />{/if}\\n    </svelte:fragment>\\n  </SplitPane>\\n</div>\\n\\n<style>\\n  .container {\\n    display: flex;\\n    flex: 0 0 100%;\\n    flex-direction: row;\\n    flex-wrap: nowrap;\\n    align-items: stretch;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAuBE,UAAU,eAAC,CAAC,AACV,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,OAAO,AACtB,CAAC\"}"
};

const Films = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $global, $$unsubscribe_global;
	$$unsubscribe_global = subscribe(global$1, value => $global = value);
	$$result.css.add(css$5);
	$$unsubscribe_global();

	return `${($$result.head += '<!-- HEAD_svelte-1bu83a1_START -->' + `${($$result.title = `<title>Captiva - Films</title>`, "")}` + '<!-- HEAD_svelte-1bu83a1_END -->', "")}

<div class="${"container svelte-1h2l22k"}">${validate_component(SplitPane, "SplitPane").$$render($$result, { leftInitialSize: "25%" }, {}, {
		right: () => {
			return `${$global.filmEditOrView === "edit"
			? `${validate_component(FilmEdit, "FilmEdit").$$render($$result, {}, {}, {})}`
			: `${validate_component(FilmView, "FilmView").$$render($$result, {}, {}, {})}`}
    `;
		},
		left: () => {
			return `${validate_component(FilmsNav, "FilmsNav").$$render($$result, {}, {}, {})}`;
		}
	})}
</div>`;
});

var component_1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Films
});

const CONTEXT_KEY = {};

/* src\components\Connect.svelte generated by Svelte v3.53.0 */

const css$4 = {
	code: ".username.svelte-17w0406{padding:2px 0;margin:0 6px;border-bottom:solid 2px transparent}",
	map: "{\"version\":3,\"file\":\"Connect.svelte\",\"sources\":[\"Connect.svelte\"],\"sourcesContent\":[\"<script>\\n  import { token } from \\\"../stores/token.js\\\";\\n  import jwt_decode from \\\"jwt-decode\\\";\\n  import { goto } from \\\"@sapper/app\\\";\\n  let username;\\n  let isConnected;\\n\\n  $: {\\n    $token = $token;\\n    username = $token ? jwt_decode($token).data.username : null;\\n    isConnected = username !== null;\\n  }\\n\\n  function logout() {\\n    $token = \\\"\\\";\\n    goto(\\\"login\\\");\\n  }\\n</script>\\n\\n<style>\\n  .username {\\n    padding: 2px 0;\\n    margin: 0 6px;\\n    border-bottom: solid 2px transparent;\\n  }\\n</style>\\n\\n{#if isConnected === false}\\n  <ul>\\n    <li><a href=\\\"login\\\">Log in</a></li>\\n  </ul>\\n{:else}\\n  <div class=\\\"username\\\">{username}</div>\\n  <ul>\\n    <li><span class=\\\"link\\\" on:click={logout}>Log out</span></li>\\n  </ul>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAoBE,SAAS,eAAC,CAAC,AACT,OAAO,CAAE,GAAG,CAAC,CAAC,CACd,MAAM,CAAE,CAAC,CAAC,GAAG,CACb,aAAa,CAAE,KAAK,CAAC,GAAG,CAAC,WAAW,AACtC,CAAC\"}"
};

const Connect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $token, $$unsubscribe_token;
	$$unsubscribe_token = subscribe(token, value => $token = value);
	let username;
	let isConnected;

	$$result.css.add(css$4);

	{
		{
			token.set($token);
			username = $token ? jwt_decode__default["default"]($token).data.username : null;
			isConnected = username !== null;
		}
	}

	$$unsubscribe_token();

	return `${isConnected === false
	? `<ul><li><a href="${"login"}">Log in</a></li></ul>`
	: `<div class="${"username svelte-17w0406"}">${escape(username)}</div>
  <ul><li><span class="${"link"}">Log out</span></li></ul>`}`;
});

/* src\components\Nav.svelte generated by Svelte v3.53.0 */

const css$3 = {
	code: "nav.svelte-s7z5of{display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;align-items:center;align-content:stretch;background-color:#264;color:#eee;box-sizing:border-box;padding:12px;font-size:0.938rem}.left.svelte-s7z5of{flex:1 1 auto;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start}.right.svelte-s7z5of{flex:1 1 auto;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-end}ul.svelte-s7z5of{display:flex;flex-direction:row}button.info.svelte-s7z5of{margin-left:4px;padding:1px 4px;border-radius:0}.right li,.left li{flex:0 1 auto}a, .link{display:inline-block;padding:1px 0;margin:0 6px;border-bottom:solid 4px #9fd6ba;color:#9fd6ba;text-decoration:none;cursor:pointer}a:hover, a:active{color:#fff;border-bottom-color:#fff}",
	map: "{\"version\":3,\"file\":\"Nav.svelte\",\"sources\":[\"Nav.svelte\"],\"sourcesContent\":[\"<script>\\r\\n  import Connect from \\\"./Connect.svelte\\\";\\r\\n  import { token } from \\\"../stores/token.js\\\";\\r\\n  import { global } from \\\"../stores/global.js\\\";\\r\\n\\r\\n  // const progs = [334, 335, 341];\\r\\n  // const progs = [124, 129, 143, 146, 150, 152];\\r\\n\\r\\n  // 2022-12-15 : On boucle sur la liste des programmes disponibles (`progs`). Si le store $global.currentProgId n'a pas de valeur, on prend le dernier programme disponible.\\r\\n  function changeProg() {\\r\\n    const progs = $global.progs;\\r\\n\\r\\n    $global.currentProgId =\\r\\n      progs[\\r\\n        (progs.indexOf($global.currentProgId || progs[progs.length - 1]) + 1) %\\r\\n          progs.length\\r\\n      ];\\r\\n    // $global.currentProgId =\\r\\n    //   progs[\\r\\n    //     (progs.indexOf($global.currentProgId || progs[progs.length - 1]) + 1) %\\r\\n    //       progs.length\\r\\n    //   ];\\r\\n  }\\r\\n\\r\\n  // export let segment;\\r\\n  $: $token = $token;\\r\\n</script>\\r\\n\\r\\n<nav>\\r\\n  <div class=\\\"left\\\">\\r\\n    <ul>\\r\\n      {#if $token !== \\\"\\\"}\\r\\n        <li><a href=\\\"films\\\">Films</a></li>\\r\\n\\r\\n        <li>\\r\\n          <button class=\\\"info\\\" on:click={changeProg}\\r\\n            >{$global.currentProgId}</button\\r\\n          >\\r\\n        </li>\\r\\n      {/if}\\r\\n    </ul>\\r\\n  </div>\\r\\n  <div class=\\\"right\\\">\\r\\n    <Connect />\\r\\n  </div>\\r\\n</nav>\\r\\n\\r\\n<style>\\r\\n  nav {\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    justify-content: flex-start;\\r\\n    align-items: center;\\r\\n    align-content: stretch;\\r\\n    background-color: #264;\\r\\n    color: #eee;\\r\\n    box-sizing: border-box;\\r\\n    padding: 12px;\\r\\n    font-size: 0.938rem;\\r\\n    /* font-size: 1rem; */\\r\\n  }\\r\\n\\r\\n  .left {\\r\\n    flex: 1 1 auto;\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    justify-content: flex-start;\\r\\n  }\\r\\n  .right {\\r\\n    flex: 1 1 auto;\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    justify-content: flex-end;\\r\\n    /* background-color: #357; */\\r\\n  }\\r\\n\\r\\n  ul {\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n  }\\r\\n\\r\\n  button.info {\\r\\n    margin-left: 4px;\\r\\n    padding: 1px 4px;\\r\\n    border-radius: 0;\\r\\n  }\\r\\n\\r\\n  :global(.right li),\\r\\n  :global(.left li) {\\r\\n    flex: 0 1 auto;\\r\\n  }\\r\\n\\r\\n  :global(a, .link) {\\r\\n    display: inline-block;\\r\\n    padding: 1px 0;\\r\\n    margin: 0 6px;\\r\\n    border-bottom: solid 4px #9fd6ba;\\r\\n    color: #9fd6ba;\\r\\n    text-decoration: none;\\r\\n    cursor: pointer;\\r\\n  }\\r\\n\\r\\n  :global(a:hover, a:active) {\\r\\n    color: #fff;\\r\\n    border-bottom-color: #fff;\\r\\n  }\\r\\n</style>\\r\\n\"],\"names\":[],\"mappings\":\"AAgDE,GAAG,cAAC,CAAC,AACH,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,UAAU,CAC3B,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,OAAO,CACtB,gBAAgB,CAAE,IAAI,CACtB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,UAAU,CACtB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,QAAQ,AAErB,CAAC,AAED,KAAK,cAAC,CAAC,AACL,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,UAAU,AAC7B,CAAC,AACD,MAAM,cAAC,CAAC,AACN,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,eAAe,CAAE,QAAQ,AAE3B,CAAC,AAED,EAAE,cAAC,CAAC,AACF,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,AACrB,CAAC,AAED,MAAM,KAAK,cAAC,CAAC,AACX,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,GAAG,CAAC,GAAG,CAChB,aAAa,CAAE,CAAC,AAClB,CAAC,AAEO,SAAS,AAAC,CACV,QAAQ,AAAE,CAAC,AACjB,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,AAChB,CAAC,AAEO,QAAQ,AAAE,CAAC,AACjB,OAAO,CAAE,YAAY,CACrB,OAAO,CAAE,GAAG,CAAC,CAAC,CACd,MAAM,CAAE,CAAC,CAAC,GAAG,CACb,aAAa,CAAE,KAAK,CAAC,GAAG,CAAC,OAAO,CAChC,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,MAAM,CAAE,OAAO,AACjB,CAAC,AAEO,iBAAiB,AAAE,CAAC,AAC1B,KAAK,CAAE,IAAI,CACX,mBAAmB,CAAE,IAAI,AAC3B,CAAC\"}"
};

const Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $token, $$unsubscribe_token;
	let $global, $$unsubscribe_global;
	$$unsubscribe_token = subscribe(token, value => $token = value);
	$$unsubscribe_global = subscribe(global$1, value => $global = value);
	//   progs[

	$$result.css.add(css$3);
	token.set($token);
	$$unsubscribe_token();
	$$unsubscribe_global();

	return `<nav class="${"svelte-s7z5of"}"><div class="${"left svelte-s7z5of"}"><ul class="${"svelte-s7z5of"}">${$token !== ""
	? `<li><a href="${"films"}">Films</a></li>

        <li><button class="${"info svelte-s7z5of"}">${escape($global.currentProgId)}</button></li>`
	: ``}</ul></div>
  <div class="${"right svelte-s7z5of"}">${validate_component(Connect, "Connect").$$render($$result, {}, {}, {})}</div>
</nav>`;
});

/* src\routes\_layout.svelte generated by Svelte v3.53.0 */

const css$2 = {
	code: "nav{position:fixed;top:0;left:0;width:100%;height:50px;background-color:#246;color:#eee;z-index:5000;overflow:hidden}main.svelte-1mwzoim{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;position:fixed;top:50px;left:0;width:100%;bottom:0;overflow:hidden}",
	map: "{\"version\":3,\"file\":\"_layout.svelte\",\"sources\":[\"_layout.svelte\"],\"sourcesContent\":[\"<script>\\r\\n  import Nav from \\\"../components/Nav.svelte\\\";\\r\\n  import { goto } from \\\"@sapper/app\\\";\\r\\n  import jwt_decode from \\\"jwt-decode\\\";\\r\\n  import { token } from \\\"../stores/token.js\\\";\\r\\n\\r\\n  let username = \\\"\\\";\\r\\n\\r\\n  export let segment;\\r\\n\\r\\n  $: {\\r\\n    $token = $token;\\r\\n    username = $token ? jwt_decode($token).data.username : \\\"\\\";\\r\\n  }\\r\\n\\r\\n  function logout() {\\r\\n    $token = \\\"\\\";\\r\\n    goto(\\\"login\\\");\\r\\n  }\\r\\n</script>\\r\\n\\r\\n<Nav {segment} />\\r\\n<main>\\r\\n  <slot />\\r\\n</main>\\r\\n\\r\\n<style>\\r\\n  :global(nav) {\\r\\n    position: fixed;\\r\\n    top: 0;\\r\\n    left: 0;\\r\\n    width: 100%;\\r\\n    height: 50px;\\r\\n    background-color: #246;\\r\\n    color: #eee;\\r\\n    z-index: 5000;\\r\\n    overflow: hidden;\\r\\n  }\\r\\n\\r\\n  main {\\r\\n    display: flex;\\r\\n    flex-direction: row;\\r\\n    flex-wrap: nowrap;\\r\\n    align-items: stretch;\\r\\n    position: fixed;\\r\\n    top: 50px;\\r\\n    left: 0;\\r\\n    width: 100%;\\r\\n    bottom: 0;\\r\\n    overflow: hidden;\\r\\n  }\\r\\n</style>\\r\\n\"],\"names\":[],\"mappings\":\"AA2BU,GAAG,AAAE,CAAC,AACZ,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,CACtB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,MAAM,AAClB,CAAC,AAED,IAAI,eAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,OAAO,CACpB,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,IAAI,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,QAAQ,CAAE,MAAM,AAClB,CAAC\"}"
};

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $token, $$unsubscribe_token;
	$$unsubscribe_token = subscribe(token, value => $token = value);
	let { segment } = $$props;

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);
	$$result.css.add(css$2);

	{
		{
			token.set($token);
			$token ? jwt_decode__default["default"]($token).data.username : "";
		}
	}

	$$unsubscribe_token();

	return `${validate_component(Nav, "Nav").$$render($$result, { segment }, {}, {})}
<main class="${"svelte-1mwzoim"}">${slots.default ? slots.default({}) : ``}
</main>`;
});

var root_comp = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Layout
});

/* src\routes\_error.svelte generated by Svelte v3.53.0 */

const css$1 = {
	code: "h1.svelte-8od9u6,p.svelte-8od9u6{margin:0 auto}h1.svelte-8od9u6{font-size:2.8em;font-weight:700;margin:0 0 0.5em 0}p.svelte-8od9u6{margin:1em auto}@media(min-width: 480px){h1.svelte-8od9u6{font-size:4em}}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let status;\\n\\texport let error;\\n\\n\\tconst dev = undefined === 'development';\\n</script>\\n\\n<style>\\n\\th1, p {\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th1 {\\n\\t\\tfont-size: 2.8em;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t}\\n\\n\\tp {\\n\\t\\tmargin: 1em auto;\\n\\t}\\n\\n\\t@media (min-width: 480px) {\\n\\t\\th1 {\\n\\t\\t\\tfont-size: 4em;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>{status}</title>\\n</svelte:head>\\n\\n<h1>{status}</h1>\\n\\n<p>{error.message}</p>\\n\\n{#if dev && error.stack}\\n\\t<pre>{error.stack}</pre>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAQC,gBAAE,CAAE,CAAC,cAAC,CAAC,AACN,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,GAAG,CAAC,IAAI,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { status } = $$props;
	let { error } = $$props;
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	$$result.css.add(css$1);

	return `${($$result.head += '<!-- HEAD_svelte-1o9r2ue_START -->' + `${($$result.title = `<title>${escape(status)}</title>`, "")}` + '<!-- HEAD_svelte-1o9r2ue_END -->', "")}

<h1 class="${"svelte-8od9u6"}">${escape(status)}</h1>

<p class="${"svelte-8od9u6"}">${escape(error.message)}</p>

${``}`;
});

/* src\node_modules\@sapper\internal\App.svelte generated by Svelte v3.53.0 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);
	if ($$props.notify === void 0 && $$bindings.notify && notify !== void 0) $$bindings.notify(notify);

	return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => {
			return `${error
			? `${validate_component(Error$1, "Error").$$render($$result, { error, status }, {}, {})}`
			: `${validate_component(level1.component || missing_component, "svelte:component").$$render($$result, Object.assign(level1.props), {}, {})}`}`;
		}
	})}`;
});

// This file is generated by Sapper — do not edit it!

const ignore = [];

const routes = [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			{ i: 0 }
		]
	},

	{
		// films.svelte
		pattern: /^\/films\/?$/,
		parts: [
			{ i: 1 }
		]
	},

	{
		// login.svelte
		pattern: /^\/login\/?$/,
		parts: [
			{ i: 2 }
		]
	}
];

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

let uid = 1;
let cid;
const _history = typeof history !== 'undefined' ? history : {
    pushState: () => { },
    replaceState: () => { },
    scrollRestoration: 'auto'
};
const scroll_history = {};
let base_url;
let handle_target;
function extract_query(search) {
    const query = Object.create(null);
    if (search.length > 0) {
        search.slice(1).split('&').forEach(searchParam => {
            const [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
            if (typeof query[key] === 'string')
                query[key] = [query[key]];
            if (typeof query[key] === 'object')
                query[key].push(value);
            else
                query[key] = value;
        });
    }
    return query;
}
function select_target(url) {
    if (url.origin !== location.origin)
        return null;
    if (!url.pathname.startsWith(base_url))
        return null;
    let path = url.pathname.slice(base_url.length);
    if (path === '') {
        path = '/';
    }
    // avoid accidental clashes between server routes and page routes
    if (ignore.some(pattern => pattern.test(path)))
        return;
    for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const match = route.pattern.exec(path);
        if (match) {
            const query = extract_query(url.search);
            const part = route.parts[route.parts.length - 1];
            const params = part.params ? part.params(match) : {};
            const page = { host: location.host, path, query, params };
            return { href: url.href, route, match, page };
        }
    }
}
function scroll_state() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}
function navigate(dest, id, noscroll, hash) {
    return __awaiter$1(this, void 0, void 0, function* () {
        const popstate = !!id;
        if (popstate) {
            cid = id;
        }
        else {
            const current_scroll = scroll_state();
            // clicked on a link. preserve scroll state
            scroll_history[cid] = current_scroll;
            cid = id = ++uid;
            scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
        }
        yield handle_target(dest);
        if (document.activeElement && (document.activeElement instanceof HTMLElement))
            document.activeElement.blur();
        if (!noscroll) {
            let scroll = scroll_history[id];
            let deep_linked;
            if (hash) {
                // scroll is an element id (from a hash), we need to compute y.
                deep_linked = document.getElementById(hash.slice(1));
                if (deep_linked) {
                    scroll = {
                        x: 0,
                        y: deep_linked.getBoundingClientRect().top + scrollY
                    };
                }
            }
            scroll_history[cid] = scroll;
            if (popstate || deep_linked) {
                scrollTo(scroll.x, scroll.y);
            }
            else {
                scrollTo(0, 0);
            }
        }
    });
}

function get_base_uri(window_document) {
    let baseURI = window_document.baseURI;
    if (!baseURI) {
        const baseTags = window_document.getElementsByTagName('base');
        baseURI = baseTags.length ? baseTags[0].href : window_document.URL;
    }
    return baseURI;
}

function goto(href, opts = { noscroll: false, replaceState: false }) {
    const target = select_target(new URL(href, get_base_uri(document)));
    if (target) {
        _history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
        return navigate(target, null, opts.noscroll);
    }
    location.href = href;
    return new Promise(() => {
        /* never resolves */
    });
}

function page_store(value) {
    const store = writable$2(value);
    let ready = true;
    function notify() {
        ready = true;
        store.update(val => val);
    }
    function set(new_value) {
        ready = false;
        store.set(new_value);
    }
    function subscribe(run) {
        let old_value;
        return store.subscribe((new_value) => {
            if (old_value === undefined || (ready && new_value !== old_value)) {
                run(old_value = new_value);
            }
        });
    }
    return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;
const stores = {
    page: page_store({}),
    preloading: writable$2(null),
    session: writable$2(initial_data && initial_data.session)
};
stores.session.subscribe((value) => __awaiter$1(void 0, void 0, void 0, function* () {
    return;
}));

/* src\routes\login.svelte generated by Svelte v3.53.0 */

const css = {
	code: ".container.svelte-6w702j{margin:24px auto;width:90%;max-width:300px;background-color:#fff;padding:12px;flex:0 0 auto;align-self:flex-start}.info.svelte-6w702j{margin:24px 0;border:0;background-color:#f66}",
	map: "{\"version\":3,\"file\":\"login.svelte\",\"sources\":[\"login.svelte\"],\"sourcesContent\":[\"<script>\\n  import { onMount } from \\\"svelte\\\";\\n  import { goto } from \\\"@sapper/app\\\";\\n  import { post } from \\\"../lib/api.js\\\";\\n  import { token } from \\\"../stores/token.js\\\";\\n  import { global } from \\\"../stores/global.js\\\";\\n  import Form from \\\"../components/lib/Form.svelte\\\";\\n\\n  let email = \\\"\\\";\\n  let password = \\\"\\\";\\n  let response;\\n  let infoMessage;\\n  $: infoMessage = infoMessage;\\n  $: {\\n    $token = $token;\\n  }\\n\\n  onMount(async () => {\\n    try {\\n      const progs = (\\n        await (await fetch(\\\"https://api.cnmtq.fr/progs\\\")).json()\\n      ).data\\n        .filter((p) => p.status === 1 || p.status === 2)\\n        .map((p) => p.id_prog)\\n        .sort();\\n\\n      $global.progs = progs;\\n    } catch (e) {\\n      console.log(e);\\n    }\\n  });\\n\\n  async function logIn() {\\n    try {\\n      response = await post(\\\"login\\\", { email, password });\\n      $token = response.token;\\n      goto(\\\"films\\\");\\n      // goto(\\\"/films\\\");\\n    } catch (error) {\\n      infoMessage = error.message;\\n    }\\n  }\\n</script>\\n\\n<svelte:head>\\n  <title>Login</title>\\n</svelte:head>\\n\\n<div class=\\\"container\\\">\\n  {#if !$token}\\n    <h1>Se connecter</h1>\\n    <Form submit={logIn}>\\n      <input bind:value={email} type=\\\"text\\\" />\\n      <input bind:value={password} type=\\\"password\\\" />\\n      <input class=\\\"center\\\" type=\\\"submit\\\" value=\\\"OK\\\" />\\n    </Form>\\n  {:else}\\n    <div>Vous êtes actuellement connecté.</div>\\n  {/if}\\n  {#if infoMessage}\\n    <div class=\\\"info\\\">{infoMessage}</div>\\n  {/if}\\n</div>\\n\\n<style>\\n  .container {\\n    margin: 24px auto;\\n    width: 90%;\\n    max-width: 300px;\\n    background-color: #fff;\\n    padding: 12px;\\n    flex: 0 0 auto;\\n    align-self: flex-start;\\n  }\\n\\n  .info {\\n    margin: 24px 0;\\n    border: 0;\\n    background-color: #f66;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAiEE,UAAU,cAAC,CAAC,AACV,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,GAAG,CACV,SAAS,CAAE,KAAK,CAChB,gBAAgB,CAAE,IAAI,CACtB,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,UAAU,AACxB,CAAC,AAED,KAAK,cAAC,CAAC,AACL,MAAM,CAAE,IAAI,CAAC,CAAC,CACd,MAAM,CAAE,CAAC,CACT,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $token, $$unsubscribe_token;
	let $global, $$unsubscribe_global;
	$$unsubscribe_token = subscribe(token, value => $token = value);
	$$unsubscribe_global = subscribe(global$1, value => $global = value);
	let email = "";
	let password = "";
	let response;
	let infoMessage;

	onMount(async () => {
		try {
			const progs = (await (await fetch("https://api.cnmtq.fr/progs")).json()).data.filter(p => p.status === 1 || p.status === 2).map(p => p.id_prog).sort();
			set_store_value(global$1, $global.progs = progs, $global);
		} catch(e) {
			console.log(e);
		}
	});

	async function logIn() {
		try {
			response = await post("login", { email, password });
			set_store_value(token, $token = response.token, $token);
			goto("films");
		} catch(error) {
			infoMessage = error.message; // goto("/films");
		}
	}

	$$result.css.add(css);
	infoMessage = infoMessage;

	{
		{
			token.set($token);
		}
	}

	$$unsubscribe_token();
	$$unsubscribe_global();

	return `${($$result.head += '<!-- HEAD_svelte-10qpq3o_START -->' + `${($$result.title = `<title>Login</title>`, "")}` + '<!-- HEAD_svelte-10qpq3o_END -->', "")}

<div class="${"container svelte-6w702j"}">${!$token
	? `<h1>Se connecter</h1>
    ${validate_component(Form, "Form").$$render($$result, { submit: logIn }, {}, {
			default: () => {
				return `<input type="${"text"}"${add_attribute("value", email, 0)}>
      <input type="${"password"}"${add_attribute("value", password, 0)}>
      <input class="${"center"}" type="${"submit"}" value="${"OK"}">`;
			}
		})}`
	: `<div>Vous êtes actuellement connecté.</div>`}
  ${infoMessage
	? `<div class="${"info svelte-6w702j"}">${escape(infoMessage)}</div>`
	: ``}
</div>`;
});

var component_2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Login
});

// This file is generated by Sapper — do not edit it!

const manifest = {
	server_routes: [
		
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: component_0 }
			]
		},

		{
			// films.svelte
			pattern: /^\/films\/?$/,
			parts: [
				{ name: "films", file: "films.svelte", component: component_1 }
			]
		},

		{
			// login.svelte
			pattern: /^\/login\/?$/,
			parts: [
				{ name: "login", file: "login.svelte", component: component_2 }
			]
		}
	],

	root_comp,
	error: Error$1
};

const build_dir = "__sapper__/build";

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/urc-ressheet+xml":["rsheet"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function get_server_route_handler(routes) {
    function handle_route(route, req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            req.params = route.params(route.pattern.exec(req.path));
            const method = req.method.toLowerCase();
            // 'delete' cannot be exported from a module because it is a keyword,
            // so check for 'del' instead
            const method_export = method === 'delete' ? 'del' : method;
            const handle_method = route.handlers[method_export];
            if (handle_method) {
                if (process.env.SAPPER_EXPORT) {
                    const { write, end, setHeader } = res;
                    const chunks = [];
                    const headers = {};
                    // intercept data so that it can be exported
                    res.write = function (chunk) {
                        chunks.push(Buffer.from(chunk));
                        return write.apply(res, [chunk]);
                    };
                    res.setHeader = function (name, value) {
                        headers[name.toLowerCase()] = value;
                        setHeader.apply(res, [name, value]);
                    };
                    res.end = function (chunk) {
                        if (chunk)
                            chunks.push(Buffer.from(chunk));
                        end.apply(res, [chunk]);
                        process.send({
                            __sapper__: true,
                            event: 'file',
                            url: req.url,
                            method: req.method,
                            status: res.statusCode,
                            type: headers['content-type'],
                            body: Buffer.concat(chunks)
                        });
                    };
                }
                const handle_next = (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(err.message);
                    }
                    else {
                        process.nextTick(next);
                    }
                };
                try {
                    yield handle_method(req, res, handle_next);
                }
                catch (err) {
                    console.error(err);
                    handle_next(err);
                }
            }
            else {
                // no matching handler for method
                process.nextTick(next);
            }
        });
    }
    return function find_route(req, res, next) {
        for (const route of routes) {
            if (route.pattern.test(req.path)) {
                handle_route(route, req, res, next);
                return;
            }
        }
        next();
    };
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return "new RegExp(" + stringifyString(thing.source) + ", \"" + thing.flags + "\")";
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped) {
            result += escaped[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream__default["default"].Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream__default["default"].PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream__default["default"]) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream__default["default"]) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream__default["default"])) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream__default["default"] && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream__default["default"]) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http__default["default"].STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url__default["default"].parse;
const format_url = Url__default["default"].format;

const streamDestructionSupported = 'destroy' in Stream__default["default"].Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream__default["default"].Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream__default["default"].PassThrough;
const resolve_url = Url__default["default"].resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch$1(url, opts) {

	// allow custom promise
	if (!fetch$1.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch$1.Promise;

	// wrap http.request into fetch
	return new fetch$1.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https__default["default"] : http__default["default"]).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream__default["default"].Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch$1.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch$1(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib__default["default"].Z_SYNC_FLUSH,
				finishFlush: zlib__default["default"].Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib__default["default"].createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib__default["default"].createInflate());
					} else {
						body = body.pipe(zlib__default["default"].createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib__default["default"].createBrotliDecompress === 'function') {
				body = body.pipe(zlib__default["default"].createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch$1.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch$1.Promise = global.Promise;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$1 = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode,
	decode: decode$1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$1 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$2 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$1,
	decode: decode$2
};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var util = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$1 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$1.fromArray(names.map(String), true);
  this._sources = ArraySet$1.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$1.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$1.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;

function get_sourcemap_url(contents) {
    const reversed = contents
        .split('\n')
        .reverse()
        .join('\n');
    const match = /\/[/*]#[ \t]+sourceMappingURL=([^\s'"]+?)(?:[ \t]+|$)/gm.exec(reversed);
    if (match)
        return match[1];
    return undefined;
}
const file_cache = new Map();
function get_file_contents(file_path) {
    if (file_cache.has(file_path)) {
        return file_cache.get(file_path);
    }
    try {
        const data = fs__default["default"].readFileSync(file_path, 'utf8');
        file_cache.set(file_path, data);
        return data;
    }
    catch (_a) {
        return undefined;
    }
}
function sourcemap_stacktrace(stack) {
    const replace = (line) => line.replace(/^ {4}at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/, (input, var_name, file_path, line_num, column) => {
        if (!file_path)
            return input;
        const contents = get_file_contents(file_path);
        if (!contents)
            return input;
        const sourcemap_url = get_sourcemap_url(contents);
        if (!sourcemap_url)
            return input;
        let dir = path__default["default"].dirname(file_path);
        let sourcemap_data;
        if (/^data:application\/json[^,]+base64,/.test(sourcemap_url)) {
            const raw_data = sourcemap_url.slice(sourcemap_url.indexOf(',') + 1);
            try {
                sourcemap_data = Buffer.from(raw_data, 'base64').toString();
            }
            catch (_a) {
                return input;
            }
        }
        else {
            const sourcemap_path = path__default["default"].resolve(dir, sourcemap_url);
            const data = get_file_contents(sourcemap_path);
            if (!data)
                return input;
            sourcemap_data = data;
            dir = path__default["default"].dirname(sourcemap_path);
        }
        let raw_sourcemap;
        try {
            raw_sourcemap = JSON.parse(sourcemap_data);
        }
        catch (_b) {
            return input;
        }
        const consumer = new SourceMapConsumer$1(raw_sourcemap);
        const pos = consumer.originalPositionFor({
            line: Number(line_num),
            column: Number(column),
            bias: SourceMapConsumer$1.LEAST_UPPER_BOUND
        });
        if (!pos.source)
            return input;
        const source_path = path__default["default"].resolve(dir, pos.source);
        const source = `${source_path}:${pos.line || 0}:${pos.column || 0}`;
        if (!var_name)
            return `    at ${source}`;
        return `    at ${var_name} (${source})`;
    });
    file_cache.clear();
    return stack
        .split('\n')
        .map(replace)
        .join('\n');
}

function get_page_handler(manifest, session_getter) {
    const get_build_info = (assets => () => assets)(JSON.parse(fs__default["default"].readFileSync(path__default["default"].join(build_dir, 'build.json'), 'utf-8')));
    const template = (str => () => str)(read_template(build_dir));
    const has_service_worker = fs__default["default"].existsSync(path__default["default"].join(build_dir, 'service-worker.js'));
    const { pages, error: error_route } = manifest;
    function bail(res, err) {
        console.error(err);
        const message = 'Internal server error';
        res.statusCode = 500;
        res.end(`<pre>${message}</pre>`);
    }
    function handle_error(req, res, statusCode, error) {
        handle_page({
            pattern: null,
            parts: [
                { name: null, component: { default: error_route } }
            ]
        }, req, res, statusCode, error || 'Unknown error');
    }
    function handle_page(page, req, res, status = 200, error = null) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const is_service_worker_index = req.path === '/service-worker-index.html';
            const build_info = get_build_info();
            res.setHeader('Content-Type', 'text/html');
            // preload main js and css
            // TODO detect other stuff we can preload like fonts?
            let preload_files = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
            if ((_a = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _a === void 0 ? void 0 : _a.main) {
                preload_files = preload_files.concat((_b = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _b === void 0 ? void 0 : _b.main);
            }
            let es6_preload = false;
            if (build_info.bundler === 'rollup') {
                es6_preload = true;
                const route = page.parts[page.parts.length - 1].file;
                const deps = build_info.dependencies[route];
                if (deps) {
                    preload_files = preload_files.concat(deps);
                }
            }
            else if (!error && !is_service_worker_index) {
                page.parts.forEach(part => {
                    if (!part)
                        return;
                    // using concat because it could be a string or an array. thanks webpack!
                    preload_files = preload_files.concat(build_info.assets[part.name]);
                });
            }
            const link = preload_files
                .filter((v, i, a) => a.indexOf(v) === i) // remove any duplicates
                .filter(file => file && !file.match(/\.map$/)) // exclude source maps
                .map((file) => {
                const as = /\.css$/.test(file) ? 'style' : 'script';
                const rel = es6_preload && as === 'script' ? 'modulepreload' : 'preload';
                return `<${req.baseUrl}/client/${file}>;rel="${rel}";as="${as}"`;
            })
                .join(', ');
            res.setHeader('Link', link);
            let session;
            try {
                session = yield session_getter(req, res);
            }
            catch (err) {
                return bail(res, err);
            }
            let redirect;
            let preload_error;
            const preload_context = {
                redirect: (statusCode, location) => {
                    if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
                        throw new Error('Conflicting redirects');
                    }
                    location = location.replace(/^\//g, ''); // leading slash (only)
                    redirect = { statusCode, location };
                },
                error: (statusCode, message) => {
                    preload_error = { statusCode, message };
                },
                fetch: (url, opts) => {
                    const protocol = req.socket.encrypted ? 'https' : 'http';
                    const parsed = new Url__default["default"].URL(url, `${protocol}://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' : ''}`);
                    opts = Object.assign({}, opts);
                    const include_credentials = (opts.credentials === 'include' ||
                        opts.credentials !== 'omit' && parsed.origin === `${protocol}://127.0.0.1:${process.env.PORT}`);
                    if (include_credentials) {
                        opts.headers = Object.assign({}, opts.headers);
                        const cookies = Object.assign({}, parse_1(req.headers.cookie || ''), parse_1(opts.headers.cookie || ''));
                        const set_cookie = res.getHeader('Set-Cookie');
                        (Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach((s) => {
                            const m = /([^=]+)=([^;]+)/.exec(s);
                            if (m)
                                cookies[m[1]] = m[2];
                        });
                        const str = Object.keys(cookies)
                            .map(key => `${key}=${cookies[key]}`)
                            .join('; ');
                        opts.headers.cookie = str;
                        if (!opts.headers.authorization && req.headers.authorization) {
                            opts.headers.authorization = req.headers.authorization;
                        }
                    }
                    return fetch$1(parsed.href, opts);
                }
            };
            let preloaded;
            let match;
            let params;
            try {
                const root_preload = manifest.root_comp.preload || (() => { });
                const root_preloaded = root_preload.call(preload_context, {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params: {}
                }, session);
                match = error ? null : page.pattern.exec(req.path);
                let toPreload = [root_preloaded];
                if (!is_service_worker_index) {
                    toPreload = toPreload.concat(page.parts.map(part => {
                        if (!part)
                            return null;
                        // the deepest level is used below, to initialise the store
                        params = part.params ? part.params(match) : {};
                        return part.component.preload
                            ? part.component.preload.call(preload_context, {
                                host: req.headers.host,
                                path: req.path,
                                query: req.query,
                                params
                            }, session)
                            : {};
                    }));
                }
                preloaded = yield Promise.all(toPreload);
            }
            catch (err) {
                if (error) {
                    return bail(res, err);
                }
                preload_error = { statusCode: 500, message: err };
                preloaded = []; // appease TypeScript
            }
            try {
                if (redirect) {
                    const location = Url__default["default"].resolve((req.baseUrl || '') + '/', redirect.location);
                    res.statusCode = redirect.statusCode;
                    res.setHeader('Location', location);
                    res.end();
                    return;
                }
                if (preload_error) {
                    if (!error) {
                        handle_error(req, res, preload_error.statusCode, preload_error.message);
                    }
                    else {
                        bail(res, preload_error.message);
                    }
                    return;
                }
                const segments = req.path.split('/').filter(Boolean);
                // TODO make this less confusing
                const layout_segments = [segments[0]];
                let l = 1;
                page.parts.forEach((part, i) => {
                    layout_segments[l] = segments[i + 1];
                    if (!part)
                        return null;
                    l++;
                });
                if (error instanceof Error && error.stack) {
                    error.stack = sourcemap_stacktrace(error.stack);
                }
                const pageContext = {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params,
                    error: error
                        ? error instanceof Error
                            ? error
                            : { message: error, name: 'PreloadError' }
                        : null
                };
                const props = {
                    stores: {
                        page: {
                            subscribe: writable$2(pageContext).subscribe
                        },
                        preloading: {
                            subscribe: writable$2(null).subscribe
                        },
                        session: writable$2(session)
                    },
                    segments: layout_segments,
                    status: error ? status : 200,
                    error: pageContext.error,
                    level0: {
                        props: preloaded[0]
                    },
                    level1: {
                        segment: segments[0],
                        props: {}
                    }
                };
                if (!is_service_worker_index) {
                    let level_index = 1;
                    for (let i = 0; i < page.parts.length; i += 1) {
                        const part = page.parts[i];
                        if (!part)
                            continue;
                        props[`level${level_index++}`] = {
                            component: part.component.default,
                            props: preloaded[i + 1] || {},
                            segment: segments[i]
                        };
                    }
                }
                const { html, head, css } = App.render(props);
                const serialized = {
                    preloaded: `[${preloaded.map(data => try_serialize(data, err => {
                        console.error(`Failed to serialize preloaded data to transmit to the client at the /${segments.join('/')} route: ${err.message}`);
                        console.warn('The client will re-render over the server-rendered page fresh instead of continuing where it left off. See https://sapper.svelte.dev/docs#Return_value for more information');
                    })).join(',')}]`,
                    session: session && try_serialize(session, err => {
                        throw new Error(`Failed to serialize session data: ${err.message}`);
                    }),
                    error: error && serialize_error(props.error)
                };
                let script = `__SAPPER__={${[
                    error && `error:${serialized.error},status:${status}`,
                    `baseUrl:"${req.baseUrl}"`,
                    serialized.preloaded && `preloaded:${serialized.preloaded}`,
                    serialized.session && `session:${serialized.session}`
                ].filter(Boolean).join(',')}};`;
                if (has_service_worker) {
                    script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
                }
                const file = [].concat(build_info.assets.main).filter(f => f && /\.js$/.test(f))[0];
                const main = `${req.baseUrl}/client/${file}`;
                // users can set a CSP nonce using res.locals.nonce
                const nonce_value = (res.locals && res.locals.nonce) ? res.locals.nonce : '';
                const nonce_attr = nonce_value ? ` nonce="${nonce_value}"` : '';
                if (build_info.bundler === 'rollup') {
                    if (build_info.legacy_assets) {
                        const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
                        script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
                    }
                    else {
                        script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
                    }
                }
                else {
                    script += `</script><script${nonce_attr} src="${main}" defer>`;
                }
                let styles;
                // TODO make this consistent across apps
                // TODO embed build_info in placeholder.ts
                if (build_info.css && build_info.css.main) {
                    const css_chunks = new Set(build_info.css.main);
                    page.parts.forEach(part => {
                        if (!part || !build_info.dependencies)
                            return;
                        const deps_for_part = build_info.dependencies[part.file];
                        if (deps_for_part) {
                            deps_for_part.filter(d => d.endsWith('.css')).forEach(chunk => {
                                css_chunks.add(chunk);
                            });
                        }
                    });
                    styles = Array.from(css_chunks)
                        .map(href => `<link rel="stylesheet" href="client/${href}">`)
                        .join('');
                }
                else {
                    styles = (css && css.code ? `<style${nonce_attr}>${css.code}</style>` : '');
                }
                const body = template()
                    .replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
                    .replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
                    .replace('%sapper.html%', () => html)
                    .replace('%sapper.head%', () => head)
                    .replace('%sapper.styles%', () => styles)
                    .replace(/%sapper\.cspnonce%/g, () => nonce_value);
                res.statusCode = status;
                res.end(body);
            }
            catch (err) {
                if (error) {
                    bail(res, err);
                }
                else {
                    handle_error(req, res, 500, err);
                }
            }
        });
    }
    return function find_route(req, res, next) {
        const path = req.path === '/service-worker-index.html' ? '/' : req.path;
        const page = pages.find(page => page.pattern.test(path));
        if (page) {
            handle_page(page, req, res);
        }
        else {
            handle_error(req, res, 404, 'Not found');
        }
    };
}
function read_template(dir = build_dir) {
    return fs__default["default"].readFileSync(`${dir}/template.html`, 'utf-8');
}
function try_serialize(data, fail) {
    try {
        return devalue(data);
    }
    catch (err) {
        if (fail)
            fail(err);
        return null;
    }
}
// Ensure we return something truthy so the client will not re-render the page over the error
function serialize_error(error) {
    if (!error)
        return null;
    let serialized = try_serialize(error);
    if (!serialized) {
        const { name, message, stack } = error;
        serialized = try_serialize({ name, message, stack });
    }
    if (!serialized) {
        serialized = '{}';
    }
    return serialized;
}

function middleware(opts = {}) {
    const { session, ignore } = opts;
    let emitted_basepath = false;
    return compose_handlers(ignore, [
        (req, res, next) => {
            if (req.baseUrl === undefined) {
                let originalUrl = req.originalUrl || req.url;
                if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
                    originalUrl += '/';
                }
                req.baseUrl = originalUrl
                    ? originalUrl.slice(0, -req.url.length)
                    : '';
            }
            if (!emitted_basepath && process.send) {
                process.send({
                    __sapper__: true,
                    event: 'basepath',
                    basepath: req.baseUrl
                });
                emitted_basepath = true;
            }
            if (req.path === undefined) {
                req.path = req.url.replace(/\?.*/, '');
            }
            next();
        },
        fs__default["default"].existsSync(path__default["default"].join(build_dir, 'service-worker.js')) && serve({
            pathname: '/service-worker.js',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        fs__default["default"].existsSync(path__default["default"].join(build_dir, 'service-worker.js.map')) && serve({
            pathname: '/service-worker.js.map',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        serve({
            prefix: '/client/',
            cache_control: 'max-age=31536000, immutable'
        }),
        get_server_route_handler(manifest.server_routes),
        get_page_handler(manifest, session || noop)
    ].filter(Boolean));
}
function compose_handlers(ignore, handlers) {
    const total = handlers.length;
    function nth_handler(n, req, res, next) {
        if (n >= total) {
            return next();
        }
        handlers[n](req, res, () => nth_handler(n + 1, req, res, next));
    }
    return !ignore
        ? (req, res, next) => nth_handler(0, req, res, next)
        : (req, res, next) => {
            if (should_ignore(req.path, ignore)) {
                next();
            }
            else {
                nth_handler(0, req, res, next);
            }
        };
}
function should_ignore(uri, val) {
    if (Array.isArray(val))
        return val.some(x => should_ignore(uri, x));
    if (val instanceof RegExp)
        return val.test(uri);
    if (typeof val === 'function')
        return val(uri);
    return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}
function serve({ prefix, pathname, cache_control }) {
    const filter = pathname
        ? (req) => req.path === pathname
        : (req) => req.path.startsWith(prefix);
    const cache = new Map();
    const read = (file) => (cache.has(file) ? cache : cache.set(file, fs__default["default"].readFileSync(path__default["default"].join(build_dir, file)))).get(file);
    return (req, res, next) => {
        if (filter(req)) {
            const type = lite.getType(req.path);
            try {
                const file = path__default["default"].posix.normalize(decodeURIComponent(req.path));
                const data = read(file);
                res.setHeader('Content-Type', type);
                res.setHeader('Cache-Control', cache_control);
                res.end(data);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    next();
                }
                else {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('an error occurred while reading a static file from disk');
                }
            }
        }
        else {
            next();
        }
    };
}
function noop() { }

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const url = dev ? "/" : "/captiva"; // https://dev.to/agustinl/deploy-sapper-pwa-on-github-pages-2ih1

polka__default["default"]()
  .use(
    url, // Ajout.
    compression__default["default"]({ threshold: 0 }),
    sirv__default["default"]("static", { dev }),
    middleware()
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
