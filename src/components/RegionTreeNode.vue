<script setup>
import { ref, inject } from "vue";
import { cell_type_color, format_cell_type_name } from "@/store/cells.js";
import EyeIcon from "@/components/EyeIcon.vue";

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  expanded: { type: Boolean, default: false },
  ancestor_hidden: { type: Boolean, default: false },  // true if a parent region is hidden
  hideable: { type: Boolean, default: true },  // false to remove the region's eye icon
});

const world = inject('world');

const is_expanded = ref(props.expanded);
const hidden = ref(world.hidden_regions.has(props.node.id));
const hidden_types = ref(Object.fromEntries(props.node.types.map(
    (type) => [type.name, world.hidden_cell_types.has(`${props.node.id}|${type.name}`)])));

function toggle_hidden() {
  hidden.value = !hidden.value;
  world.set_region_visible(props.node.id, !hidden.value);
}

function toggle_type_hidden(type) {
  hidden_types.value[type] = !hidden_types.value[type];
  world.set_cell_type_visible(props.node.id, type, !hidden_types.value[type]);
}

// Auto-expand a child when it is the only one, so that single-child chains (root > grey > CB > ...) open at once.
const expand_child = props.node.children.length === 1;

function toggle() {
  is_expanded.value = !is_expanded.value;
}

function percent(count) {
  return `${(100 * count / props.node.count).toFixed(1)}% of ${props.node.name}`;
}

function cssColor(color) {
  return `rgb(${color.slice(0, 3).map((c) => Math.round(c * 255)).join(", ")})`;
}
</script>

<template>
  <div class="tree-node">
    <div class="tree-row" :class="{ dimmed: hidden || ancestor_hidden }" :style="{ paddingLeft: depth * 16 + 'px' }"
         @click="toggle" :title="node.name">
      <span class="caret" :class="{ open: is_expanded, empty: node.children.length === 0 && node.types.length === 0 }">&#9656;</span>
      <span class="swatch" :style="{ backgroundColor: cssColor(node.color) }"></span>
      <span class="name">{{ node.name }}</span>
      <span class="count">{{ node.count.toLocaleString() }}</span>
      <EyeIcon v-if="hideable" :hidden="hidden" @click.stop="toggle_hidden" />
      <span v-else class="eye-placeholder"></span>
    </div>
    <div v-if="is_expanded">
      <!-- cell type breakdown is only listed for leaf regions -->
      <div class="type-row" v-for="type in (node.children.length === 0 ? node.types : [])" :key="type.name"
           :class="{ dimmed: hidden_types[type.name] || hidden || ancestor_hidden }"
           :style="{ paddingLeft: (depth + 1) * 16 + 20 + 'px' }" :title="percent(type.count)">
        <span class="swatch dot" :style="{ backgroundColor: cssColor(cell_type_color(type.name)) }"></span>
        <span class="name">{{ format_cell_type_name(type.name) }}</span>
        <span class="count">{{ type.count.toLocaleString() }}</span>
        <EyeIcon :hidden="hidden_types[type.name]" @click.stop="toggle_type_hidden(type.name)" />
      </div>
      <RegionTreeNode v-for="child in node.children" :key="child.id"
                      :node="child" :depth="depth + 1" :expanded="expand_child"
                      :ancestor_hidden="ancestor_hidden || hidden" />
    </div>
  </div>
</template>

<style scoped>
.tree-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 3px;
  padding-bottom: 3px;
  color: #ddd;
  font-size: 16px;
  font-family: sans-serif;
  cursor: pointer;
  border-radius: 3px;
}

.tree-row:hover {
  background-color: #4a4a4a;
}

.caret {
  width: 12px;
  flex-shrink: 0;
  color: #aaa;
  transition: transform 0.2s;
}

.caret.open {
  transform: rotate(90deg);
}

.caret.empty {
  visibility: hidden;
}

.dimmed {
  opacity: 0.45;
}

.eye-placeholder {
  width: 20px;
  flex-shrink: 0;
}

.type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
  color: #aaa;
  font-size: 15px;
  font-style: italic;
  font-family: sans-serif;
}

.swatch.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.swatch {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 2px;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  flex-shrink: 0;
  color: #aaa;
  font-variant-numeric: tabular-nums;
}
</style>
