<script setup>
  import { onMounted, ref, inject } from "vue";

  const target = ref();
  const world = inject('world');
  const worldLoaded = inject('worldLoaded');

  onMounted(() => {
    world.render_column();
    world.init(target.value);
    worldLoaded.value = true;
  });
</script>

<template>
  <div ref="target">

  </div>
</template>

<style scoped>

</style>