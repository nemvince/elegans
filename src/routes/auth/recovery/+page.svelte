<script lang="ts">
  import { goto } from '$app/navigation'

  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  const { data } = $props()
</script>

<Card.Root class="max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Recovery Code</Card.Title>
    <Card.Description
      >Your recovery code is below. You can use this recovery code if you lose access to your second
      factors.</Card.Description
    >
  </Card.Header>
  <Card.Content>
    <div class="grid gap-4">
      <div class="grid gap-2">
        <Label for="recoveryCode">Recovery Code</Label>
        <Input id="recoveryCode" type="text" value={data.recoveryCode} readonly />
      </div>
      <Button type="button" class="w-full" onclick={() => goto('/')}>Next</Button>
    </div>
  </Card.Content>
</Card.Root>
