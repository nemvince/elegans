<script lang="ts">
  import * as Form from '$lib/components/ui/form'
  import * as Card from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { formSchema, type FormSchema } from './schema'
  import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props()

  const form = superForm(data.form, {
    validators: zodClient(formSchema)
  })

  const { form: formData, enhance } = form
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>Enter your email below to login to your account</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <Form.Field {form} name="email">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Email</Form.Label>
            <Input {...props} bind:value={$formData.email} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Password</Form.Label>
            <Input {...props} type="password" bind:value={$formData.password} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button type="submit" class="mt-4 w-full">Login</Form.Button>
    </form>

    <div class="mt-4 flex flex-col gap-3 text-center text-sm">
      <a href="/auth/forgot" class="underline"> Forgot your password? </a>
      <span>
        Don't have an account?
        <a href="/auth/register" class="underline"> Sign up </a>
      </span>
    </div>
  </Card.Content>
</Card.Root>
