<!-- DirectoryScraper.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../types/agents';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Alert } from '$lib/components/ui/alert';

  const dispatch = createEventDispatcher();
  
  let directoryPath = '';
  let isLoading = false;
  let error: string | null = null;

  async function handleScan() {
    if (!directoryPath) {
      error = 'Please enter a directory path';
      return;
    }

    isLoading = true;
    error = null;

    try {
      const response = await fetch('/api/scan-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: directoryPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scan directory');
      }

      const data = await response.json();
      dispatch('agentsFound', data.agents);
    } catch (e) {
      error = `Error scanning directory: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex gap-2">
    <Input
      type="text"
      placeholder="/path/to/agents/directory"
      bind:value={directoryPath}
      class="flex-1"
    />
    <Button 
      on:click={handleScan}
      disabled={isLoading}
    >
      {isLoading ? 'Scanning...' : 'Scan Directory'}
    </Button>
  </div>
  
  {#if error}
    <Alert variant="destructive">
      <p>{error}</p>
    </Alert>
  {/if}
  
  <div class="text-xs text-muted-foreground">
    Enter the path to a directory containing agent configuration files. The system will scan for JSON, YAML, or other configuration files and attempt to extract agent data.
  </div>
</div>