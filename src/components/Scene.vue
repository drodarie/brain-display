<script setup>
  import { onMounted, ref, inject } from "vue";

  const target = ref();
  const world = inject('world');

  onMounted(() => {
    world.render_column();
    world.init(target.value);
  });
</script>

<template>
  <div ref="target">

  </div>
</template>

<style scoped>

</style>