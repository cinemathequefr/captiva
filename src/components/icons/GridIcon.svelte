<script>
  export let size = 10;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 200 200"
  style="width:{size}px; height:{size}px;"
  aria-hidden="true"
  focusable="false"
>
  <!-- <path
    stroke-width="30"
    d="M185 15v170H15V15h170ZM100 0v200m100-100H.00000381"
  /> -->
  <!-- <path stroke-width="35" d="M185 15v170H15V15h170Z" />
  <path stroke-width="35" d="M100 0v200m100-100H.00000381" /> -->
  <path stroke="#000" stroke-width="30" d="M185 15v170H15V15h170Z" />
  <circle cx="100" cy="100" r="50" />
</svg>

<style>
  svg {
    display: inline-block;
    opacity: 0.65;
  }

  path {
    stroke: var(--color, #747);
  }
  circle {
    fill: var(--color, #747);
  }
</style>
