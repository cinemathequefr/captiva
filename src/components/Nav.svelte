<script>
  import Connect from "./Connect.svelte";
  import { token } from "../stores/token.js";
  // export let segment;
  $: $token = $token;
</script>

<nav>
  <div class="left">
    <ul>
      {#if $token !== ""}
        <li><a href="films">Films</a></li>
      {/if}
    </ul>
  </div>
  <div class="right">
    <Connect />
  </div>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    align-content: stretch;
    background-color: #264;
    color: #eee;
    box-sizing: border-box;
    padding: 12px;
    font-size: 0.938rem;
    /* font-size: 1rem; */
  }

  .left {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }
  .right {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    /* background-color: #357; */
  }

  :global(.right li),
  :global(.left li) {
    flex: 0 1 auto;
  }

  :global(a, .link) {
    display: inline-block;
    padding: 1px 0;
    margin: 0 6px;
    border-bottom: solid 4px #9fd6ba;
    color: #9fd6ba;
    text-decoration: none;
    cursor: pointer;
  }

  :global(a:hover, a:active) {
    color: #fff;
    border-bottom-color: #fff;
  }
</style>
