<script setup>
import { ref, reactive, inject } from "vue";

const world = inject('world');

const sideNavStyle = reactive({ width: "2rem" });
const arrowStyle = reactive({ transform: "rotate(0deg)" });
const is_nav_open = ref(false);

function toggle_nav() {
  is_nav_open.value = !is_nav_open.value;
  sideNavStyle.width = is_nav_open.value ? "20rem" : "2rem";
  arrowStyle.transform = is_nav_open.value ? "rotate(180deg)" : "rotate(0deg)";
}

const lightBackground = ref(world.light_background);
const pointRendering = ref(world.point_rendering);
const pointColormap = ref(world.point_colormap);
const pointScale = ref(world.point_scale);
const glowSc = ref(world.glowSc);

function onToggleBackground() {
  lightBackground.value = !lightBackground.value;
  world.toggle_background_color();
}

function onPointRenderingChange() {
  world.toggle_point_rendering(pointRendering.value);
}

function onColormapChange() {
  world.toggle_point_color(pointColormap.value);
}

function onPointScaleChange() {
  world.set_point_radius_scale(pointScale.value);
}

function onGlowScChange() {
  world.set_glowSc(glowSc.value);
}
</script>

<template>
  <div class="sidenav" :style="sideNavStyle">
    <div class="arrow" @click="toggle_nav" :style="arrowStyle"></div>
    <h1 v-show="is_nav_open">Settings</h1>
    <hr v-show="is_nav_open">
    <div class="controls" v-show="is_nav_open">
      <div class="control-group">
        <label>Light background</label>
        <input type="checkbox" :checked="lightBackground" />
        <div class="toggler-slider" @click="onToggleBackground">
          <div class="toggler-knob"></div>
        </div>
      </div>
      <div class="control-group">
        <label>Point style</label>
        <select v-model="pointRendering" @change="onPointRenderingChange">
          <option value="sphere">Sphere</option>
          <option value="circle">Circle</option>
          <option value="blended">Blended</option>
        </select>
      </div>
      <div class="control-group">
        <label>Colormap</label>
        <select v-model="pointColormap" @change="onColormapChange">
          <option value="regions">Regions</option>
          <option value="orientations">Orientations</option>
          <option value="types">Types</option>
          <option value="mtypes">M-types</option>
        </select>
      </div>
      <div class="control-group">
        <label>Point radius</label>
        <input type="range" min="0.5" max="15" step="0.5" v-model.number="pointScale" @input="onPointScaleChange" />
      </div>
      <div class="control-group">
        <label>Glow</label>
        <input type="range" min="0" max="3" step="0.05" v-model.number="glowSc" @input="onGlowScChange" />
      </div>
    </div>
  </div>
</template>

<style scoped>

.sidenav {
  height: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #3a3a3a;
  overflow: hidden;
  transition: width 0.5s;
}
h1 {
    color: #fff;
    text-align: center;
    padding: 20px;
}
.arrow {
  position: absolute;
  background-image: url("@/assets/textures/fullscr.png");
  background-size: contain;
  background-repeat: no-repeat;
  width: 25px;
  height: 50px;
  transition: transform 0.5s;
  top: 50%;
  right: 4px;
  cursor: pointer;
}

.controls {
  padding: 20px 35px 16px 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 30px 14px;
  min-width: 218px;
}

.control-group {
  display: contents;
}

label {
  color: #ccc;
  font-size: 13px;
  font-family: sans-serif;
  white-space: nowrap;
}

select {
  width: 100%;
  padding: 3px 6px;
  background: #555;
  color: #fff;
  border: 1px solid #777;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

input[type="range"] {
  width: 100%;
  cursor: pointer;
  accent-color: #8af;
}

input[type="checkbox"]:checked+.toggler-slider .toggler-knob {
	left: calc(100% - 19px - 3px);
}

input[type="checkbox"] {
	display: none;
}

.toggler-slider {
	background-color: #ccc;
	position: relative;
	border-radius: 5px;
	top: 0;
	right: 0;
	width: 45px;
	height: 26px;
	-webkit-transition: all 300ms ease;
	transition: all 300ms ease;
  justify-self: end;
}

.toggler-knob {
	position: absolute;
	-webkit-transition: all 300ms ease;
	transition: all 300ms ease;
	width: calc(25px - 6px);
	height: calc(25px - 6px);
	border-radius: 50%;
	left: 3px;
	top: 3px;
	background-color: #fff;
  cursor: pointer;
}
</style>
