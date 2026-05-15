<script setup>
  import {onMounted, ref} from "vue";
  import {World} from "@/store/world.js";

  const target = ref();
  const world = new World();

  onMounted(() => {
    world.render_whole_brain();
    world.init(target.value);
    window.world = world;
  });
</script>

<template>
  <div ref="target">

  </div>
</template>

<style scoped>

</style>