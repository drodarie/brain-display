<script setup>
defineProps({
  hidden: { type: Boolean, default: false },
});
</script>

<template>
  <span class="eye" :title="hidden ? 'Show' : 'Hide'">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      <line v-if="hidden" x1="3" y1="3" x2="21" y2="21" />
    </svg>
  </span>
</template>

<style scoped>
.eye {
  display: flex;
  flex-shrink: 0;
  color: #aaa;
  cursor: pointer;
}

.eye:hover {
  color: #fff;
}
</style>
