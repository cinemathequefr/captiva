<script>
  import { goto } from "@sapper/app";
  import { post } from "../lib/api.js";
  import { token } from "../stores/token.js";
  import Form from "../components/lib/Form.svelte";

  let email = "";
  let password = "";
  let response;
  let infoMessage;
  $: infoMessage = infoMessage;
  $: {
    $token = $token;
  }

  async function logIn() {
    try {
      response = await post("login", { email, password });
      $token = response.token;
      goto("/films");
    } catch (error) {
      infoMessage = error.message;
    }
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="container">
  {#if !$token}
    <h1>Se connecter</h1>
    <Form submit={logIn}>
      <input bind:value={email} type="text" />
      <input bind:value={password} type="password" />
      <input class="center" type="submit" value="OK" />
    </Form>
  {:else}
    <div>Vous êtes actuellement connecté.</div>
  {/if}
  {#if infoMessage}
    <div class="info">{infoMessage}</div>
  {/if}
</div>

<style>
  .container {
    margin: 24px auto;
    width: 90%;
    max-width: 300px;
    background-color: #fff;
    padding: 12px;
    flex: 0 0 auto;
    align-self: flex-start;
  }

  .info {
    margin: 24px 0;
    border: 0;
    background-color: #f66;
  }
</style>
