<script>
  export let status;
  export let size = 12;
</script>

<svg
  style="width:{size}px; height:{size}px;"
  viewBox="0 0 100 100"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle class="status{status}" cx="50" cy="60" r="30" />
</svg>

<style>
  svg > circle {
    fill: transparent;
  }
  .status0 {
    fill: #fd1c3a;
  }
  .status1 {
    fill: #fdb61e;
  }
  .status2 {
    fill: #18bd78;
  }
  .status3 {
    fill: #1878bd;
  }
</style>
