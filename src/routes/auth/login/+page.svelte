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
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>Enter your email below to login to your account</Card.Description>
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
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a href="/auth/forgot" class="ml-auto inline-block text-sm underline">
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </div>
      <p>{form?.message ?? ''}</p>
    </form>
    <div class="mt-4 text-center text-sm">
      Don't have an account?
      <a href="/auth/register" class="underline"> Sign up </a>
    </div>
  </Card.Content>
</Card.Root>
