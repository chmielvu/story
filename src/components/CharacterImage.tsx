// src/components/CharacterImage.tsx

import { defineComponent, type PropType } from 'vue';

export const CharacterImage = defineComponent({
    props: {
        imageUrl: { type: String as PropType<string>, required: true },
        isLoading: { type: Boolean as PropType<boolean>, required: true },
        errorMessage: { type: String as PropType<string>, required: true },
    },
    template: `
      <div class="relative w-full aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-2xl" :style="{ 'box-shadow': '0 25px 50px -12px var(--shadow-color)' }">
        <div v-if="isLoading" class="absolute z-10 inset-0 flex items-center justify-center bg-black/50">
          <div class="w-16 h-16 border-4 border-t-transparent border-accent-primary rounded-full animate-spin"></div>
          <span class="absolute mt-20 text-sm text-text-muted">Altering reality...</span>
        </div>
        <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover transition-opacity duration-1000" :class="{ 'opacity-50': isLoading, 'opacity-100': !isLoading }"/>
        <div v-if="errorMessage" class="absolute bottom-2 left-2 text-xs text-red-400 bg-black/50 p-1 rounded">{{ errorMessage }}</div>
      </div>
    `
});