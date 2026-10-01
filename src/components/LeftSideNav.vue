<script setup>
import { ref, reactive, inject, watch } from "vue";
import RegionTreeNode from "@/components/RegionTreeNode.vue";

const world = inject('world');

const sideNavStyle = reactive({ width: "2rem" });
const arrowStyle = reactive({ transform: "rotate(0deg)" });
const is_nav_open = ref(false);

function toggle_nav() {
  is_nav_open.value = !is_nav_open.value;
  sideNavStyle.width = is_nav_open.value ? "26rem" : "2rem";
  arrowStyle.transform = is_nav_open.value ? "rotate(180deg)" : "rotate(0deg)";
}

const activeTab = ref("regions");
const regionTree = ref(null);  // list of root nodes, null while loading

const lightBackground = ref(world.light_background);
const pointRendering = ref(world.point_rendering);
const pointColormap = ref(world.point_colormap);
const pointScale = ref(world.point_scale);
const pointScaleMin = ref(world.point_scale / 10);
const pointScaleMax = ref(world.point_scale * 2);
const glowSc = ref(world.glowSc);
const autoRotate = ref(world.auto_rotate);

const worldLoaded = inject('worldLoaded');
watch(worldLoaded, (loaded) => {
  if (loaded) {
    pointScaleMin.value = world.point_scale / 10;
    pointScaleMax.value = world.point_scale * 2;
    pointScale.value = world.point_scale;
    world.get_region_tree().then((tree) => { regionTree.value = tree; });
  }
});

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

function onToggleAutoRotate() {
  autoRotate.value = !autoRotate.value;
  world.toggle_auto_rotate();
}
</script>

<template>
  <div class="sidenav" :style="sideNavStyle">
    <div class="arrow" @click="toggle_nav" :style="arrowStyle"></div>
    <div class="panel" v-show="is_nav_open">
      <div class="tabs">
        <button :class="{ active: activeTab === 'regions' }" @click="activeTab = 'regions'">Regions</button>
        <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">Settings</button>
      </div>
      <div class="regions" v-show="activeTab === 'regions'">
        <div class="tree-header">
          <span>Region</span>
          <span>Cells</span>
        </div>
        <p class="loading" v-if="regionTree === null">Loading...</p>
        <!-- a single root can't be hidden: it would hide everything -->
        <RegionTreeNode v-for="root in regionTree" :key="root.id" :node="root" :expanded="true"
                        :hideable="regionTree.length > 1" />
      </div>
      <div class="controls" v-show="activeTab === 'settings'">
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
          <input type="range" :min="pointScaleMin" :max="pointScaleMax" step="0.1" v-model.number="pointScale" @input="onPointScaleChange" />
        </div>
        <div class="control-group">
          <label>Glow</label>
          <input type="range" min="0" max="3" step="0.05" v-model.number="glowSc" @input="onGlowScChange" />
        </div>
        <div class="control-group">
          <label>Auto-rotate</label>
          <input type="checkbox" :checked="autoRotate" />
          <div class="toggler-slider" @click="onToggleAutoRotate">
            <div class="toggler-knob"></div>
          </div>
        </div>
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
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(26rem - 35px);
}

.tabs {
  display: flex;
  border-bottom: 1px solid #555;
}

.tabs button {
  flex: 1;
  padding: 16px 0 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 18px;
  font-family: sans-serif;
  cursor: pointer;
}

.tabs button:hover {
  color: #fff;
}

.tabs button.active {
  color: #fff;
  border-bottom-color: #8af;
}

.regions {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px 16px 12px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  padding: 0 0 6px 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid #555;
  color: #888;
  font-size: 13px;
  font-family: sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.loading {
  color: #aaa;
  font-size: 16px;
  font-family: sans-serif;
  padding: 8px 16px;
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
  padding: 20px 0 16px 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 30px 14px;
  min-width: 280px;
}

.control-group {
  display: contents;
}

label {
  color: #ccc;
  font-size: 16px;
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
  font-size: 16px;
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
