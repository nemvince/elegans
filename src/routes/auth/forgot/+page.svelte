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
    <Card.Title class="text-2xl">Forgot your password?</Card.Title>
    <Card.Description>Enter your email below to reset your password</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            autocomplete="username"
            required
            value={form?.email ?? ''}
          />
        </div>
        <Button type="submit" class="w-full">Send</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      Remembered your password?
      <a href="/auth/login" class="underline"> Sign in </a>
    </div>
  </Card.Content>
</Card.Root>
