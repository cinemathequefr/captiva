<script>
  import Nav from "../components/Nav.svelte";
  import { goto } from "@sapper/app";
  import jwt_decode from "jwt-decode";
  import { token } from "../stores/token.js";

  let username = "";

  export let segment;

  $: {
    $token = $token;
    username = $token ? jwt_decode($token).data.username : "";
  }

  function logout() {
    $token = "";
    goto("login");
  }
</script>

<Nav {segment} />
<main>
  <slot />
</main>

<style>
  :global(nav) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background-color: #246;
    color: #eee;
    z-index: 5000;
    overflow: hidden;
  }

  main {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    position: fixed;
    top: 50px;
    left: 0;
    width: 100%;
    bottom: 0;
    overflow: hidden;
  }
</style>
