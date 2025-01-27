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
    <Card.Title class="text-2xl">Recover your account</Card.Title>
    <Card.Description>Enter your recovery code below to reset your 2FA</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <Form.Field {form} name="code">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Code</Form.Label>
            <Input {...props} bind:value={$formData.code} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button class="mt-4 w-full">Verify</Form.Button>
    </form>
  </Card.Content>
</Card.Root>
