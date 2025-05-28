import cudm from "../lib/format/cudm";

/**
 * clean_input_on_paste_blur
 * Handler d'une action Svelte use:clean_input_on_paste_blur.
 * Ce handler permet l'utilisation d'une action Svelte pour appeler cudm en réponse aux événements paste et blur sur un champ input ou textarea.
 * Précédemment, on avait une déclaration directe sur le nœud : on:blur et on:paste, mais cela ne permettait pas d'accéder à la valeur réactive de la saisie, quand il y a en a une.
 * Cette solution fonctionne aussi bien sur les champs pour lesquels on fait un bind:value (quand on veut passer cette valeur en prop au component CountChar, par exemple) que pour les champs sans bind:value.
 * Le paramètre cudm_opts (à passer en premier argument) est optionnel et correspond à l'objet d'options de cudm.
 * @version 2025-05-28
 * @param {*} node Nœud DOM sur lequel porte l'action (passé en premier argument implicite par use:clean_input_on_paste_blur).
 * @param {*} cudm_opts Optionnel : objet d'options de cudm (en pratique, si nécessaire : { singleLine: true })
 * @returns
 */
export function clean_input_on_paste_blur(node, cudm_opts = {}) {
  console.log(cudm_opts);
  const handle_event = (e) => {
    setTimeout(() => {
      node.value = cudm(node.value, cudm_opts);
      node.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);
  };
  node.addEventListener("blur", handle_event);
  node.addEventListener("paste", handle_event);

  return {
    destroy: function () {
      node.removeEventListener("blur", handle_event);
      node.removeEventListener("paste", handle_event);
    },
  };
}
