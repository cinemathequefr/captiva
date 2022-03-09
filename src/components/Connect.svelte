<script>
  import { token } from "../stores/token.js";
  import jwt_decode from "jwt-decode";
  import { goto } from "@sapper/app";
  let username;
  let isConnected;

  $: {
    $token = $token;
    username = $token ? jwt_decode($token).data.username : null;
    isConnected = username !== null;
  }

  function logout() {
    $token = "";
    goto("login");
  }
</script>

<style>
  .username {
    padding: 2px 0;
    margin: 0 6px;
    border-bottom: solid 2px transparent;
  }
</style>

{#if isConnected === false}
  <ul>
    <li><a href="login">Log in</a></li>
  </ul>
{:else}
  <div class="username">{username}</div>
  <ul>
    <li><span class="link" on:click={logout}>Log out</span></li>
  </ul>
{/if}
