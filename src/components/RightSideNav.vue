<script setup>
import {ref, onMounted, onBeforeUnmount, inject, reactive} from "vue";

const world = inject('world');

const sideNavStyle = reactive({ width: "2rem" });
const arrowStyle = reactive({ transform: "rotate(180deg)" });
const is_nav_open = ref(false);

function toggle_nav() {
  is_nav_open.value = !is_nav_open.value;
  sideNavStyle.width = is_nav_open.value ? "20rem" : "2rem";
  arrowStyle.transform = is_nav_open.value ? "rotate(0deg)" : "rotate(180deg)";
}

const cells = ref([]);
let rafId = null;

function poll() {
  // world.selected_cells is mutated in place (push/splice); copy so the ref's reference actually changes.
  let temp = world.selected_cells.slice();
  if (temp.length > cells.value.length && !is_nav_open.value) {
    toggle_nav();
  }
  cells.value = temp;
  rafId = requestAnimationFrame(poll);
}

function closeCell(id) {
  world.deselect_cell(id);
}

function formatPosition(position) {
  return position.map((v) => v.toFixed(1)).join(", ");
}

function formatCellTypeName(cellType) {
  cellType = cellType.replaceAll("_", " ");
  return cellType.charAt(0).toUpperCase() + cellType.slice(1);
}

onMounted(() => {
  poll();
});

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="sidenav-right" :style="sideNavStyle">
    <div class="arrow" @click="toggle_nav" :style="arrowStyle"></div>
    <h1 v-show="is_nav_open">Selected cells</h1>
    <hr v-show="is_nav_open">
    <div class="cards" v-show="is_nav_open">
      <div class="cell-card" v-for="cell in cells" :key="cell.id">
        <button class="close-btn" @click="closeCell(cell.id)" title="Close">&times;</button>
        <div class="card-row">
          <span class="label">ID</span>
          <span>{{ cell.id }}</span>
        </div>
        <div class="card-row">
          <span class="label">Region</span>
          <span>{{ cell.region }}</span>
        </div>
        <div class="card-row">
          <span class="label">Type</span>
          <span>{{ formatCellTypeName(cell.type) }}</span>
        </div>
        <div class="card-row">
          <span class="label">Position</span>
          <span>{{ formatPosition(cell.position) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidenav-right {
  height: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  background-color: #3a3a3a;
  overflow-y: hidden;
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
  left: 4px;
  cursor: pointer;
}

hr {
  border-color: #555;
}

.cards {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-left: 20px;
}

.cell-card {
  position: relative;
  background: #4a4a4a;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 12px 14px;
}

.close-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  line-height: 18px;
  padding: 0;
  background: #555;
  color: #fff;
  border: 1px solid #777;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.close-btn:hover {
  background: #777;
}

.card-row {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 6px;
  padding: 3px 0;
  font-size: 13px;
  font-family: sans-serif;
}

.label {
  color: #aaa;
}

.card-row span:last-child {
  color: #fff;
  word-break: break-word;
}
</style>
