<!-- 
2025-05-25 : version améliorée ? À tester.
https://gemini.google.com/app/7a54d915f7e10a5d
-->
<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";

  export let leftInitialSize = "50%";
  export let minLeftWidth = 50; // New prop: minimum width for the left pane
  export let minRightWidth = 50; // New prop: minimum width for the right pane

  let leftDiv; // Renamed 'left' to 'leftDiv' to avoid potential confusion
  let isDragging = false;
  let initialLeftWidth; // Store initial width for relative dragging
  let initialClientX; // Store initial mouse X position for relative dragging

  const dispatch = createEventDispatcher(); // For custom events

  function dragstart(e) {
    isDragging = true;
    document.body.style.userSelect = "none"; // Prevent text selection during drag
    document.body.style.cursor = "col-resize"; // Set global cursor during drag

    initialLeftWidth = leftDiv.getBoundingClientRect().width;
    initialClientX = e.clientX;

    // Attach global mousemove and mouseup listeners
    // This ensures dragging continues even if the mouse leaves the component
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragend);

    dispatch("dragstart"); // Dispatch custom event
  }

  function drag(e) {
    if (!isDragging) return;

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      const deltaX = e.clientX - initialClientX;
      let newWidth = initialLeftWidth + deltaX;

      const totalWidth = leftDiv.parentElement.getBoundingClientRect().width;

      // Boundary constraints
      if (newWidth < minLeftWidth) {
        newWidth = minLeftWidth;
      } else if (totalWidth - newWidth < minRightWidth) {
        // Ensure right pane doesn't go below its min width
        newWidth = totalWidth - minRightWidth;
      }

      leftDiv.style.flexBasis = `${newWidth}px`;
    });
  }

  function dragend() {
    if (!isDragging) return; // Important check as dragend might be called if mouseup outside
    isDragging = false;
    document.body.style.userSelect = "auto"; // Reset user-select
    document.body.style.cursor = "auto"; // Reset cursor

    // Remove global event listeners
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", dragend);

    dispatch("dragend"); // Dispatch custom event
  }

  // Lifecycle hooks to ensure global listeners are cleaned up if component is unmounted
  // (though in this case, the `dragend` already handles it)
  onMount(() => {
    // Any setup that needs to happen when the component mounts
  });

  onDestroy(() => {
    // Ensure cleanup if component is destroyed while dragging (unlikely but good practice)
    if (isDragging) {
      dragend(); // Call dragend to reset state and remove listeners
    }
  });
</script>

<div class="split-pane">
  <div bind:this={leftDiv} class="left" style="flex-basis: {leftInitialSize}">
    <slot name="left" />
  </div>
  <div class="splitter" class:drag={isDragging} on:mousedown={dragstart} />
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
    user-select: none; /* Prevent text selection on splitter itself */
    transition: 0.1s;
  }

  .splitter:hover,
  .splitter.drag {
    background-color: #999;
  }

  .split-pane {
    display: flex;
    width: 100%;
    max-width: 100%;
    /* flex: 0 0 100%; - Removed, as width: 100% and flex children handle sizing */
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    height: 100%; /* Important: Assumes parent has a defined height */
  }

  .left {
    /*
        flex: 0 0 25%; - Removed, as flex-basis is controlled by prop and drag
        */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent content from overflowing */
    background-color: #aaa; /* Example background */
  }

  .right {
    flex: 1 1 auto; /* Ensures it takes up remaining space and is flexible */
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto; /* Allows content to scroll vertically */
    background-color: #ddd; /* Example background */
  }
</style>
