<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  
  export let type: 'success' | 'error' | 'info' = 'info';
  export let message: string;
  export let duration = 3000;
  
  const dispatch = createEventDispatcher();
  
  let visible = true;
  
  if (duration > 0) {
    setTimeout(() => {
      visible = false;
      setTimeout(() => dispatch('remove'), 300);
    }, duration);
  }
  
  function close() {
    visible = false;
    setTimeout(() => dispatch('remove'), 300);
  }
  
  $: typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];
</script>

{#if visible}
  <div
    class="fixed top-4 right-4 z-50 max-w-sm w-full"
    transition:fly={{ x: 300, duration: 300 }}
  >
    <div class="border rounded-lg p-4 shadow-lg {typeClasses}">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">{message}</p>
        <button
          on:click={close}
          class="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}