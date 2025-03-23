<!-- +page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import ImportCSV from './ImportCSV.svelte';
  import DirectoryScraper from './DirectoryScraper.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { Agent } from '../../types/agents';
  
  let agents: Agent[] = [];
  let isLoading = false;
  let isCreating = false;
  let showImport = false;
  
  onMount(async () => {
    await fetchAgents();
  });
  
  async function fetchAgents() {
    isLoading = true;
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      agents = await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      // You would typically show a toast notification here
    } finally {
      isLoading = false;
    }
  }
  
  async function handleImportedAgents(event: CustomEvent<Agent[]>) {
    const importedAgents = event.detail;
    isLoading = true;
    try {
      for (const agent of importedAgents) {
        await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agent),
        });
      }
      await fetchAgents();
      showImport = false;
      // You would typically show a success toast notification here
    } catch (error) {
      console.error('Error importing agents:', error);
      // You would typically show an error toast notification here
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container mx-auto py-6 space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Agents</h1>
    <div class="flex items-center gap-4">
      <div class="relative">
        <Button 
          variant="outline" 
          on:click={() => showImport = !showImport}
        >
          Import Agents
        </Button>
        
        {#if showImport}
          <div class="absolute right-0 mt-2 w-96 bg-background border rounded-md shadow-lg z-10 p-4 space-y-4">
            <h3 class="font-medium">Import From CSV</h3>
            <ImportCSV on:agentsImported={handleImportedAgents} />
            
            <div class="border-t my-2 pt-2">
              <h3 class="font-medium">Scan Directory</h3>
              <p class="text-xs text-muted-foreground mb-2">
                Scan a directory for agent configuration files
              </p>
              <DirectoryScraper on:agentsFound={handleImportedAgents} />
            </div>
          </div>
        {/if}
      </div>
      <Button on:click={() => isCreating = true}>New Agent</Button>
    </div>
  </div>
  
  <!-- Agent list display would go here -->
  {#if isLoading}
    <div class="flex justify-center my-8">
      <p>Loading agents...</p>
    </div>
  {:else if agents.length === 0}
    <div class="text-center my-8 p-6 border rounded-lg">
      <h3 class="text-lg font-medium mb-2">No agents found</h3>
      <p class="text-muted-foreground">Create a new agent or import agents to get started.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each agents as agent}
        <div class="border rounded-lg p-4 hover:shadow-md transition">
          <h3 class="font-medium">{agent.name}</h3>
          <p class="text-sm text-muted-foreground">{agent.description}</p>
          <div class="mt-4 flex gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>