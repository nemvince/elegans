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
    <Card.Title class="text-2xl">Create an account</Card.Title>
    <Card.Description
      >Your username must be at least 3 characters long and your password must be at least 8
      characters long.</Card.Description
    >
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="form-signup.username">Username</Label>
          <Input
            id="form-signup.username"
            name="username"
            required
            value={form?.username ?? ''}
            minlength={3}
            maxlength={32}
          />
        </div>
        <div class="grid gap-2">
          <Label for="form-signup.email">Email</Label>
          <Input
            type="email"
            id="form-signup.email"
            name="email"
            autocomplete="username"
            required
            value={form?.email ?? ''}
          />
        </div>
        <div class="grid gap-2">
          <Label for="form-signup.password">Password</Label>
          <Input
            type="password"
            id="form-signup.password"
            name="password"
            autocomplete="new-password"
            required
          />
        </div>
        <Button type="submit" class="w-full">Continue</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      Already have an account?
      <a href="/auth/login" class="underline"> Sign in </a>
    </div>
  </Card.Content>
</Card.Root>
