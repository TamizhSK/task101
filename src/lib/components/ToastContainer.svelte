<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast';
  import { Toast } from '$lib/components/ui/toast';
</script>

{#each $toasts as toast (toast.id)}
  <Toast
    type={toast.type}
    message={toast.message}
    duration={toast.duration}
    on:remove={() => removeToast(toast.id)}
  />
{/each}