<!-- D'après https://github.com/vikignt/svelte-mui/blob/master/src/Snackbar.svelte -->
<script>
  import { onDestroy, createEventDispatcher, onMount } from "svelte";
  import { fly } from "svelte/transition";
  const dispatch = createEventDispatcher();
  export let visible = false;
  export { className as class };
  let className = "";
  export let style = "";
  export let bottom = true;
  export let bg = "#9fc";
  export let color = "#000";
  export let timeout = 1.5;

  let timerId;
  $: if (visible === true) {
    clearTimeout(timerId);
    timerId = undefined;
    if (timeout > 0) {
      timerId = setTimeout(() => {
        visible = false;
        timerId = undefined;
      }, timeout * 1000);
    }
  }
  onDestroy(() => {
    clearTimeout(timerId);
    timerId = undefined;
  });
  function iend({ target }) {
    dispatch("open");
  }
  function oend({ target }) {
    dispatch("close");
  }
</script>

{#if visible}
  <div
    in:fly={{ y: bottom ? 48 : -48, duration: 350 }}
    out:fly={{ y: bottom ? 48 : -48, duration: 350 }}
    on:introend={(e) => iend(e)}
    on:outroend={(e) => oend(e)}
    class={"snackbar " + className}
    class:top={!bottom}
    class:bottom
    style={`color: ${color}; background: ${bg};${style}`}
  >
    <div class="snackbar-content">
      <slot />
    </div>
  </div>
{/if}

<style>
  .snackbar {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 6px 16px;
    margin: 4px 0;
    min-height: 48px;
    min-width: 144px;
    max-width: 568px;
    position: fixed;
    flex-wrap: nowrap;
    z-index: 50;
    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
      0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
  }
  /* .action {
    margin-right: -16px;
    padding: 0 8px;
    margin-left: auto;
  } */

  .snackbar-content {
    text-align: center;
    flex: 1 1 auto;
  }

  .top {
    top: 0;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
  }
  .bottom {
    bottom: 0;
    left: 50%;
    border-radius: 2px 2px 0 0;
    transform: translate3d(-50%, 0, 0);
  }
  @media only screen and (max-width: 600px) {
    .snackbar {
      max-width: 100%;
      left: 0;
      right: 0;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
