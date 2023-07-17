<script>
  import Connect from "./Connect.svelte";
  import { token } from "../stores/token.js";
  import { global } from "../stores/global.js";

  const progs = [152, 158];
  // const progs = [124, 129, 143, 146, 150, 152];

  // 2022-12-15 : On boucle sur la liste des programmes disponibles (`progs`). Si le store $global.currentProgId n'a pas de valeur, on prend le dernier programme disponible.
  function changeProg() {
    $global.currentProgId =
      progs[
        (progs.indexOf($global.currentProgId || progs[progs.length - 1]) + 1) %
          progs.length
      ];
  }

  // export let segment;
  $: $token = $token;
</script>

<nav>
  <div class="left">
    <ul>
      {#if $token !== ""}
        <li><a href="films">Films</a></li>

        <li>
          <button class="info" on:click={changeProg}
            >{$global.currentProgId}</button
          >
        </li>
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

  ul {
    display: flex;
    flex-direction: row;
  }

  button.info {
    margin-left: 4px;
    padding: 1px 4px;
    border-radius: 0;
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
