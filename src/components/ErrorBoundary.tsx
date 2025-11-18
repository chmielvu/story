// src/components/ErrorBoundary.tsx
import { defineComponent, ref, onErrorCaptured } from 'vue';

export const ErrorBoundary = defineComponent({
  name: 'ErrorBoundary',
  setup(_, { slots }) {
    const hasError = ref(false);
    const errorMessage = ref('');

    onErrorCaptured((err: Error) => {
      console.error("Caught by Error Boundary:", err);
      hasError.value = true;
      errorMessage.value = err.message || 'An unexpected error occurred.';
      // Prevent the error from propagating further up the component tree
      return false; 
    });

    const resetError = () => {
      // The simplest and most effective way to reset the app's state is to reload the page.
      window.location.reload();
    };

    return {
      hasError,
      errorMessage,
      resetError,
      slots,
    };
  },
  template: `
    <div v-if="hasError" class="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-8 text-center">
      <div class="bg-surface-primary p-8 rounded-lg shadow-2xl border border-red-800/50 max-w-lg">
        <h1 class="text-3xl font-serif text-red-400 mb-4">A thread has snapped...</h1>
        <p class="text-text-secondary mb-6">
          The loom has encountered an unexpected tangle in the weave of fate. Please try to refresh the narrative to begin again.
        </p>
        <p v-if="errorMessage" class="text-xs text-text-muted bg-surface-secondary p-2 rounded mb-6 font-mono">
          <strong>Error Details:</strong> {{ errorMessage }}
        </p>
        <button @click="resetError" 
                class="glow-button relative z-10 w-full sm:w-1/2 px-10 py-4 bg-accent-primary/80 text-background font-bold rounded-md shadow-lg hover:bg-accent-secondary transition-all duration-300">
            Try Weaving Again
        </button>
      </div>
    </div>
    <div v-else>
      <slot></slot>
    </div>
  `,
});
