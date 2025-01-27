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
    <Card.Title class="text-2xl">Forgot your password?</Card.Title>
    <Card.Description>Enter your email below to reset your password</Card.Description>
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
        <Form.Description>Enter the email associated with your account.</Form.Description>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button class="w-full">Send</Form.Button>
    </form>
    <div class="mt-4 text-center text-sm">
      Remembered your password?
      <a href="/auth/login" class="underline">Sign in</a>
    </div>
  </Card.Content>
</Card.Root>
