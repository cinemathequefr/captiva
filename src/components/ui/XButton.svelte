<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let style = "";
</script>

<button {style} on:click={() => dispatch("click")}><slot /></button>

<style>
  button {
    padding: 0;
    margin: 0;
    display: inline-block;
    background-color: transparent;
    border-radius: 0;
    text-align: center;
    cursor: pointer;
  }
</style>
