<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner'
  import '../app.css'

  const { children } = $props()
</script>

<Toaster theme="dark" />

{@render children()}
