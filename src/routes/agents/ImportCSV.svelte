<!-- ImportCSV.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Alert } from '$lib/components/ui/alert';
  import type { Agent } from '../../types/agents';
  import Papa from 'papaparse';

  const dispatch = createEventDispatcher();
  
  let isLoading = false;
  let error: string | null = null;

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    isLoading = true;
    error = null;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        isLoading = false;
        if (results.errors.length > 0) {
          error = `Error parsing CSV: ${results.errors[0].message}`;
          return;
        }

        try {
          const agents = results.data.map((row: any) => {
            // Validate required fields
            if (!row.name) {
              throw new Error('Name is required for all agents');
            }

            return {
              id: row.id || crypto.randomUUID(),
              name: row.name,
              description: row.description || '',
              instructions: row.instructions || '',
              model: row.model || 'gpt-3.5-turbo',
              temperature: parseFloat(row.temperature) || 0.7,
              systemPrompt: row.systemPrompt || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Agent;
          });

          dispatch('agentsImported', agents);
          target.value = '';
        } catch (e) {
          error = `Error processing CSV data: ${e instanceof Error ? e.message : String(e)}`;
        }
      },
      error: (errorObj) => {
        isLoading = false;
        error = `Error reading CSV file: ${errorObj.message}`;
      }
    });
  }
</script>

<div class="space-y-2">
  <Button 
    variant="outline"
    on:click={() => document.getElementById('csv-file-input')?.click()}
    disabled={isLoading}
  >
    {isLoading ? "Importing..." : "Import Agents (CSV)"}
  </Button>
  <Input
    id="csv-file-input"
    type="file"
    accept=".csv"
    on:change={handleFileUpload}
    class="hidden"
    disabled={isLoading}
  />
  {#if error}
    <Alert variant="destructive">
      <p>{error}</p>
    </Alert>
  {/if}
  <div class="text-xs text-muted-foreground">
    CSV should include columns: name (required), description, instructions, model, temperature, systemPrompt
  </div>
</div>