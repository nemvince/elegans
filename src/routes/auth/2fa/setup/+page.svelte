<script lang="ts">
  import { enhance } from '$app/forms'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import * as InputOTP from '$lib/components/ui/input-otp'

  const { data, form } = $props()
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Set up two-factor authentication</Card.Title>
    <Card.Description>Scan the QR code below with your authentication app</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="mx-auto mb-4 h-64 w-64">
      <!-- eslint-disable svelte/no-at-html-tags -->
      {@html data.qrcode}
    </div>
    <form method="post" use:enhance>
      <div class="grid gap-4">
        <input name="key" value={data.encodedTOTPKey} hidden required />
        <div class="grid gap-2">
          <Label for="form-totp.code">Verify the code from the app</Label>
          <!-- <Input id="form-totp.code" name="code" required /> -->
          <InputOTP.Root maxlength={6} name="code" required class="mx-auto">
            {#snippet children({ cells })}
              <InputOTP.Group>
                {#each cells.slice(0, 3) as cell}
                  <InputOTP.Slot {cell} />
                {/each}
              </InputOTP.Group>
              <InputOTP.Separator />
              <InputOTP.Group>
                {#each cells.slice(3, 6) as cell}
                  <InputOTP.Slot {cell} />
                {/each}
              </InputOTP.Group>
            {/snippet}
          </InputOTP.Root>
        </div>
        <Button type="submit" class="w-full">Save</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
  </Card.Content>
</Card.Root>
