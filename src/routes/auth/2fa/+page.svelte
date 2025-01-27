<script lang="ts">
  import { enhance } from '$app/forms'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import * as InputOTP from '$lib/components/ui/input-otp'

  const { form } = $props()
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Two-factor authentication</Card.Title>
    <Card.Description>Enter the code from your authenticator app.</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="form-totp.code">Code</Label>
          <!-- <Input id="form-totp.code" name="code" autocomplete="one-time-code" required /> -->
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
        <Button type="submit" class="w-full">Verify</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      <a href="/auth/2fa/reset" class="underline">Use recovery code</a>
    </div>
  </Card.Content>
</Card.Root>
