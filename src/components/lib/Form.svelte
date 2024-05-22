<script>
  import { onMount } from "svelte";

  export let options;
  export let submit;

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
        if (t.scrollHeight > t.offsetHeight)
          t.style.height = `${t.scrollHeight + 2}px`;
      }
    }
  });
</script>

<form bind:this={elForm} on:submit|preventDefault={submit}>
  <slot />
</form>

<style>
  :global(form) {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
  }

  :global(fieldset) {
    width: 100%;
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
    margin: 0;
    border: 0;
    padding: 4px 0 0 0;
  }

  :global(fieldset.buttons-container) {
    margin: 12px 0;
    justify-content: flex-end;
  }

  :global(fieldset.buttons-container label) {
    flex-grow: 0;
  }

  :global(form label) {
    flex: 1 1 auto;
    margin: 0 3px 0 0;
  }

  :global(form label > div) {
    font-size: 0.75rem;
    color: #888;
  }

  :global(input[type="text"], textarea, select) {
    width: 100%;
    font-size: 0.938rem;
    border: none;
    padding: 8px;
    background-color: #eee;
    outline: none;
  }

  :global(input[type="text"], select) {
    line-height: 1rem;
  }

  :global(input[type="text"]:focus, textarea:focus) {
    background-color: #fff;
  }

  :global(textarea) {
    resize: vertical;
    height: 8rem;
    min-height: 38px;
  }

  :global(textarea.single-line) {
    height: 38px;
  }

  :global(.bold) {
    font-weight: 700;
  }

  :global(button, input[type="submit"]) {
    margin: 2px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    /* border: solid 1px #999;
    cursor: pointer; */
    transition: 0.1s;
  }

  :global(button.mini, input[type="submit"].mini) {
    font-size: 0.75em;
    padding: 2px 4px;
  }

  :global(button.yes, input[type="submit"].yes) {
    background-color: #686;
    color: #fff;
    /* border-color: #396; */
  }

  /*
  :global(button.yes:hover, input[type="submit"].yes:hover) {
    background-color: #6c9;
  }
  */

  /*
  :global(button.yes, input[type="submit"].yes) {
    background-color: #9fc;
    border-color: #396;
  }

  :global(button.yes:hover, input[type="submit"].yes:hover) {
    background-color: #6c9;
  }
  */

  :global(button.no, input[type="submit"].no) {
    background-color: #f99;
    border-color: #933;
  }

  :global(button.no:hover, input[type="submit"].no:hover) {
    background-color: #c66;
  }
</style>
