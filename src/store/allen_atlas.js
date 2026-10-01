import brain_hierarchy from '@/assets/1.json';

class AllenData {
    constructor() {
        this._data = {};
        this.name = {};
        this.color = {};
        this.children = {};
        this.parent = {};
        this.include(brain_hierarchy.msg[0], null);
    }

    include(data, parent_id) {
        let _id = data.id;
        let children = data.children;
        this._data[_id] = data;
        this.parent[_id] = parent_id;
        this.name[_id] = data.name;
        this.color[_id] = this.hex_to_rgb(data.color_hex_triplet);
        this.children[_id] = children.map((child) => child.id);
        for (let i = 0; i < children.length; i++) {
            this.include(children[i], _id);
        }
    }

    // Synthetic regions (negative ids) are not part of the Allen hierarchy; attach them to a real parent.
    add_region(id, name, color, parent_id) {
        this.name[id] = name;
        this.color[id] = color;
        this.parent[id] = parent_id;
        this.children[id] = [];
        this.children[parent_id].push(id);
    }

    // Builds the region tree for a dict {region_id: {cell_type: number of cells}}, with root_ids as top-level regions.
    // Each node's counts include all its descendants. Only regions containing cells are kept, children in atlas
    // order; cells of regions outside every root's subtree are left out. When a root is inside another root's
    // subtree, its cells are only counted in the innermost root's tree.
    // Returns a list of root nodes {id, name, color, count, types: [{name, count}], children} in root_ids order,
    // where types is sorted by decreasing count; ids absent from the atlas are appended as extra roots.
    // Regions of extra_ids (e.g. displayed meshes) are kept even without cells, if they are inside a root's subtree.
    build_count_tree(counts, root_ids = [997], extra_ids = []) {
        root_ids = root_ids.filter((id) => {
            if (id in this.name) return true;
            console.warn(`Region ${id} is not in the atlas, it is ignored as a root of the region tree.`);
            return false;
        });
        if (root_ids.length === 0) root_ids = [997];
        const is_root = new Set(root_ids);
        const totals = {};  // region id -> {cell_type: count}
        const add = (id, types) => {
            totals[id] = totals[id] || {};
            for (const type in types) totals[id][type] = (totals[id][type] || 0) + types[type];
        };
        // Adds types to region id and its ancestors up to the closest root; ignored if outside every root's subtree.
        const add_to_tree = (id, types) => {
            const ancestors = [];
            let cur = id;
            while (cur !== null && cur !== undefined && !is_root.has(cur)) {
                ancestors.push(cur);
                cur = this.parent[cur];
            }
            if (!is_root.has(cur)) return;
            ancestors.push(cur);
            for (const ancestor of ancestors) add(ancestor, types);
        };
        const unknown = [];
        for (const key in counts) {
            const id = Number(key);
            if (id in this.name) add_to_tree(id, counts[key]);
            else unknown.push(id);
        }
        for (const id of extra_ids) {
            if (id in this.name) add_to_tree(id, {});
        }
        const make_node = (id, name, color, types, children) => ({
            id: id,
            name: name,
            color: color,
            count: Object.values(types).reduce((sum, n) => sum + n, 0),
            types: Object.entries(types).map(([type, n]) => ({ name: type, count: n })).sort((x, y) => y.count - x.count),
            children: children,
        });
        const make_region = (id) => make_node(id, this.name[id], this.color[id], totals[id],
            (this.children[id] || []).filter((c) => c in totals && !is_root.has(c)).map(make_region));
        const roots = root_ids.filter((id) => id in totals).map(make_region);
        for (const id of unknown) {
            roots.push(make_node(id, `Unknown region (${id})`, [0.5, 0.5, 0.5], counts[id], []));
        }
        return roots;
    }

    // True if region id or one of its ancestors is in the set hidden_regions.
    is_hidden(id, hidden_regions) {
        for (let cur = id; cur !== null && cur !== undefined; cur = this.parent[cur]) {
            if (hidden_regions.has(cur)) return true;
        }
        return false;
    }

    hex_to_rgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [
            parseInt(result[1], 16) / 255.0,
            parseInt(result[2], 16) / 255.0,
            parseInt(result[3], 16) / 255.0
        ];
    }
}

export let allen_data = new AllenData();
allen_data.color[997] = [80.7 / 255.0, 80.7 / 255.0, 80.7 / 255.0];

allen_data.add_region(-1, "Inferior Olive", [0.46, 0.376, 0.54, 1.0], 83);  // Inferior olivary complex
allen_data.add_region(-2, "Deep Cerebellar Nuclei", [0.3, 0.3, 0.3, 1.0], 519);  // Cerebellar nuclei
allen_data.add_region(-3, "Granular Layer", [0.7, 0.15, 0.15, 1.0], 528);  // Cerebellar cortex
allen_data.add_region(-4, "Purkinje layer", [0.275, 0.800, 0.275, 1.0], 528);
allen_data.add_region(-5, "Molecular layer", [1, 0.647, 0, 1.0], 528);
