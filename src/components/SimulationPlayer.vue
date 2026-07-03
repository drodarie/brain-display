<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from "vue";

const world = inject('world');

const simulations = ref([]);
const selected = ref("");
const isRunning = ref(false);
const isPaused = ref(false);
const progress = ref(0);

let rafId = null;

function refreshSimulations() {
  simulations.value = world.list_simulations();
  if (!simulations.value.includes(selected.value)) {
    selected.value = simulations.value.length > 0 ? simulations.value[0] : "";
  }
}

function onPlay() {
  if (!selected.value) return;
  world.launch_simulation(selected.value);
}

function onStop() {
  world.stop_simulation();
}

function onPauseResume() {
  if (!world.is_simulation_running && world.simulation_progress>0) {
    world.resume_simulation();
  } else {
    world.pause_simulation();
  }
}

function poll() {
  isRunning.value = world.is_simulation_running;
  isPaused.value = !world.is_simulation_running && world.simulation_progress>0;
  progress.value = world.simulation_progress;
  rafId = requestAnimationFrame(poll);
}

onMounted(() => {
  refreshSimulations();
  poll();
});

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="sim-player">
    <select v-model="selected" :disabled="isRunning">
      <option v-if="simulations.length === 0" value="" disabled>No simulations found</option>
      <option v-for="name in simulations" :key="name" :value="name">{{ name }}</option>
    </select>
    <button @click="onPlay" :disabled="isRunning || !selected">Play</button>
    <button @click="onPauseResume" :disabled="!isRunning && !isPaused">{{ isPaused ? "Resume" : "Pause" }}</button>
    <button @click="onStop" :disabled="!isRunning && !isPaused">Stop</button>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.sim-player {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background-color: #3a3a3a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

select {
  padding: 4px 6px;
  background: #555;
  color: #fff;
  border: 1px solid #777;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

button {
  padding: 4px 12px;
  background: #555;
  color: #fff;
  border: 1px solid #777;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}

.progress-track {
  width: 160px;
  height: 8px;
  background: #666;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #8af;
}
</style>
