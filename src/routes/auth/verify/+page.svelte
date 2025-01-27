<script lang="ts">
  import { enhance } from '$app/forms'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import * as InputOTP from '$lib/components/ui/input-otp/index.js'

  const { data, form } = $props()
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Verify your email address</Card.Title>
    <Card.Description>We sent an 8-digit code to {data.email}.</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance action="?/verify">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="form-verify.code">Code</Label>
          <!-- <Input id="form-verify.code" name="code" required /> -->
          <InputOTP.Root maxlength={8} name="code" required>
            {#snippet children({ cells })}
              <InputOTP.Group>
                {#each cells as cell}
                  <InputOTP.Slot {cell} />
                {/each}
              </InputOTP.Group>
            {/snippet}
          </InputOTP.Root>
        </div>
        <Button type="submit" class="w-full">Verify</Button>
      </div>
      <p>{form?.verify?.message ?? ''}</p>
    </form>
    <form method="post" use:enhance action="?/resend" class="mt-4">
      <Button type="submit" class="w-full">Resend code</Button>
      <p>{form?.resend?.message ?? ''}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      <a href="/settings" class="underline">Change your email</a>
    </div>
  </Card.Content>
</Card.Root>
