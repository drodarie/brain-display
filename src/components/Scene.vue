<script setup>
  import {onMounted, ref} from "vue";
  import {World} from "@/store/world.js";

  const target = ref();
  const world = new World();

  onMounted(() => {
    target.value.appendChild(world.renderer.domElement);
    world.render_whole_brain();
    world.init(target.value);
  });
</script>

<template>
  <div ref="target">

  </div>
</template>

<style scoped>

</style>