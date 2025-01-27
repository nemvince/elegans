<script lang="ts">
  import { enhance } from '$app/forms'

  const { data, form } = $props()
</script>

<h1>Set up two-factor authentication</h1>
<div style="width:200px; height: 200px;">
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html data.qrcode}
</div>
<form method="post" use:enhance>
  <input name="key" value={data.encodedTOTPKey} hidden required />
  <label for="form-totp.code">Verify the code from the app</label>
  <input id="form-totp.code" name="code" required /><br />
  <button>Save</button>
  <p>{form?.message ?? ''}</p>
</form>
