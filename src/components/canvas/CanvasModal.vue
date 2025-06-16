<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click="handleBackdropClick"
  >
    <!-- Backdrop with proper opacity matching app design -->
    <div class="fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div>
    
    <!-- Modal Content -->
    <div
      ref="modalRef"
      class="relative z-50 bg-white rounded-lg shadow-xl w-full mx-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
      :class="[
        maxWidth,
        'animate-in fade-in-0 zoom-in-95'
      ]"
      @click.stop
    >
      <!-- Header -->
      <div v-if="title || $slots.header" class="flex items-center justify-between p-4 border-b border-gray-200">
        <div v-if="$slots.header">
          <slot name="header" />
        </div>
        <div v-else>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p v-if="description" class="text-sm text-gray-600 mt-1">{{ description }}</p>
        </div>
        
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors rounded-sm p-1 hover:bg-gray-100"
          :aria-label="closeLabel"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-4" :class="contentClass">
        <slot />
      </div>
      
      <!-- Footer -->
      <div v-if="$slots.footer" class="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  maxWidth?: string;
  contentClass?: string;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-md',
  contentClass: '',
  closeLabel: 'Close',
  closeOnBackdrop: true
});

const emit = defineEmits<{
  close: [];
}>();

const modalRef = ref<HTMLDivElement>();

const handleBackdropClick = (e: Event) => {
  if (props.closeOnBackdrop && e.target === e.currentTarget) {
    emit('close');
  }
};

// Expose the modal ref for focus management
defineExpose({
  modalRef
});
</script>

<style scoped>
/* Animation classes for smooth modal transitions */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

.animate-in {
  animation: fadeIn 200ms ease-out, zoomIn 200ms ease-out;
}
</style> 