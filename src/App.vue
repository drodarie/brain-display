<script setup>
import { provide, ref } from 'vue';
import SceneVue from './components/Scene.vue';
import LeftSideNav from "@/components/LeftSideNav.vue";
import SimulationPlayer from "@/components/SimulationPlayer.vue";
import { World } from "@/store/world.js";

const world = new World();
provide('world', world);
window.world = world;

const worldLoaded = ref(false);
provide('worldLoaded', worldLoaded);
</script>

<template>
<!--  <header>-->
<!--    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />-->
<!--  </header>-->

  <main>
    <LeftSideNav />
    <SceneVue />
    <SimulationPlayer />
  </main>
</template>

