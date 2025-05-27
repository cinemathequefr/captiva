<script>
  export let value = "";
  $: count = value.replace(/_|<[^>]+>|(\r?\n|\r)+/g, "").length;
</script>

{#if count > 0}<div
    class="count-char"
    class:long={count >= 500 && count <= 800}
    class:alert={count > 750}
  >
    🡓 {count} car
  </div>{/if}

<style>
  .count-char {
    flex: 0 0 auto;
    text-align: right;
    display: inline-block;
    padding: 0 4px;
    margin-bottom: 1px;
    font-size: 0.75rem;
    letter-spacing: -0.025rem;
  }

  .long {
    color: #33a;
  }
  .alert {
    color: #a33;
    font-weight: 600;
  }
</style>
