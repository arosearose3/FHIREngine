<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Import components
  import ServerPicker from '$lib/components/ServerPicker.svelte';
  import EventAuthor from '$lib/components/EventAuthor.svelte';
  import ActivityDefinitionEditor from '$lib/components/ActivityDefinitionEditor.svelte';
  import WorkflowCanvas from '$lib/components/WorkflowCanvas.svelte';
  import Workflows from '$lib/components/Workflows.svelte';
  import ActivityMonitor from '$lib/components/ActivityMonitor.svelte';

  // Create a store for tracking the active page
  export const activePage = writable('Choose Server');

  // Define navigation items
  const navItems = [
    'Choose Server',
    'Events', 
    'Activities', 
    'Author Workflows', 
    'Manage Workflows', 
    'Monitor Tasks'
  ];

  // Function to change active page
  function changePage(page) {
    activePage.set(page);
  }
</script>

<main class="container">
  <header>
    <h1>FHIREngine</h1>
  </header>
  
  <nav class="navigation">
    {#each navItems as item}
      <button 
        class:active={$activePage === item}
        on:click={() => changePage(item)}
      >
        {item}
      </button>
    {/each}
  </nav>

  <!-- Render components based on active page -->
  {#if $activePage === 'Choose Server'}
    <ServerPicker />
  {:else if $activePage === 'Events'}
    <EventAuthor />
  {:else if $activePage === 'Activities'}
    <ActivityDefinitionEditor />
  {:else if $activePage === 'Author Workflows'}
    <WorkflowCanvas />
  {:else if $activePage === 'Manage Workflows'}
    <Workflows />
  {:else if $activePage === 'Monitor Tasks'}
    <ActivityMonitor />
  {/if}
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    color: var(--primary-color);
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
  }

  .navigation {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
  }

  .navigation button {
    background-color: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s, color 0.3s;
  }

  .navigation button:hover {
    background-color: var(--hover-background);
  }

  .navigation button.active {
    background-color: var(--primary-color);
    color: white;
  }
</style>