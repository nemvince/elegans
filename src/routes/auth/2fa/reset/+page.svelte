<script lang="ts">
  import { enhance } from '$app/forms'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  const { form } = $props()
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Recover your account</Card.Title>
    <Card.Description>Enter your recovery code below to reset your 2FA</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="form-totp.code">Recovery code</Label>
          <Input id="form-totp.code" name="code" required />
        </div>
        <Button type="submit" class="w-full">Verify</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
  </Card.Content>
</Card.Root>
