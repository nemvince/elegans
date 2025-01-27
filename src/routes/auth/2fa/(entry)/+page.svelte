<script lang="ts">
  import * as Form from '$lib/components/ui/form'
  import * as Card from '$lib/components/ui/card'
  import * as InputOTP from '$lib/components/ui/input-otp'
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
    <Card.Title class="text-2xl">Two-Factor authentication</Card.Title>
    <Card.Description>Enter the 6-digit code from your authentication app</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" use:enhance>
      <Form.Field {form} name="code" class="mb-4 flex flex-col items-center">
        <Form.Control>
          {#snippet children({ props })}
            <InputOTP.Root maxlength={6} {...props} bind:value={$formData.code}>
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
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
        <Form.Description>Enter the 6-digit code from your authentication app</Form.Description>
      </Form.Field>

      <Form.Button class="w-full">Save</Form.Button>
    </form>
  </Card.Content>
</Card.Root>
