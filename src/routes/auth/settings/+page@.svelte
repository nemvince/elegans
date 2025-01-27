<script lang="ts">
  import { enhance } from '$app/forms'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  const { data, form } = $props()
</script>

<main class="container mx-auto">
  <h1 class="py-8 text-3xl font-bold">Settings</h1>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <section>
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-2xl">Update email</Card.Title>
        </Card.Header>
        <Card.Content>
          <p>Your email: {data.user.email}</p>
          <form method="post" use:enhance action="?/email">
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="form-email.email">New email</Label>
                <Input type="email" id="form-email.email" name="email" required />
              </div>
              <Button type="submit">Update</Button>
            </div>
            <p>{form?.email?.message ?? ''}</p>
          </form>
        </Card.Content>
      </Card.Root>
    </section>

    <section>
      <Card.Root>
        <Card.Header>
          <Card.Title class="text-2xl">Update password</Card.Title>
        </Card.Header>
        <Card.Content>
          <form method="post" use:enhance action="?/password">
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="form-password.password">Current password</Label>
                <Input
                  type="password"
                  id="form-password.password"
                  name="password"
                  autocomplete="current-password"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="form-password.new-password">New password</Label>
                <Input
                  type="password"
                  id="form-password.new-password"
                  name="new_password"
                  autocomplete="new-password"
                  required
                />
              </div>
              <Button type="submit">Update</Button>
            </div>
            <p>{form?.password?.message ?? ''}</p>
          </form>
        </Card.Content>
      </Card.Root>
    </section>

    {#if data.user.registered2FA}
      <section>
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-2xl">Update two-factor authentication</Card.Title>
          </Card.Header>
          <Card.Content>
            <Button class="w-full">
              <a href="/auth/2fa/setup">Update</a>
            </Button>
          </Card.Content>
        </Card.Root>
      </section>
    {/if}

    {#if data.recoveryCode !== null}
      <section>
        <Card.Root>
          <Card.Header>
            <Card.Title class="text-2xl">Recovery code</Card.Title>
          </Card.Header>
          <Card.Content>
            <p>Your recovery code is: {data.recoveryCode}</p>
            <Button>Generate new code</Button>
          </Card.Content>
        </Card.Root>
      </section>
    {/if}
  </div>
</main>
