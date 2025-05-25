<!-- https://svelte.dev/repl/d4503273a9014687a85cd87954dae4c0?version=3.44.3 -->
<script>
  export let leftInitialSize = "50%";

  let left;
  let isDragging = false;

  function dragstart() {
    isDragging = true;

    document.body.style.userSelect = "none";
  }

  function drag(e) {
    if (!isDragging) return;

    const elementLeft = left.getBoundingClientRect().left;
    left.style.flexBasis = e.clientX - elementLeft + "px";
  }

  function dragend() {
    if (!isDragging) return;

    isDragging = false;
    document.body.style.userSelect = "auto";
  }
</script>

<div class="split-pane" on:mousemove={drag} on:mouseup={dragend}>
  <div bind:this={left} class="left" style="flex-basis: {leftInitialSize}">
    <slot name="left" />
  </div>
  <div class="splitter" on:mousedown={dragstart} />
  <div class="right">
    <slot name="right" />
  </div>
</div>

<style>
  .splitter {
    display: block;
    flex: 0 0 auto;
    width: 3px;
    background-color: #666;
    cursor: col-resize;
  }

  .split-pane {
    display: flex;
    width: 100%;
    max-width: 100%;

    flex: 0 0 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  .left {
    flex: 0 0 25%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #aaa;
  }

  .right {
    flex: 1 1 75%;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #ddd;
  }
</style>
