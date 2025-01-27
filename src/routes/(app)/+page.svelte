<script lang="ts">
  import { enhance } from '$app/forms'

  const { data } = $props()
</script>

<header>
  <a href="/">Home</a>
  <a href="/settings">Settings</a>
</header>
<main>
  <h1>Hi {data.user.username}!</h1>
  <form method="post" use:enhance>
    <button>Sign out</button>
  </form>
</main>
