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
        for (let i = 0; i < children.length; i++) {
            this.children[_id] = children[i].id;
        }
        for (let i = 0; i < children.length; i++) {
            this.include(children[i], _id);
        }
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

allen_data.name[-1] = "Inferior Olive";
allen_data.color[-1] = [0.46, 0.376, 0.54, 1.0];
allen_data.name[-2] = "Deep Cerebellar Nuclei";
allen_data.color[-2] = [0.3, 0.3, 0.3, 1.0];
allen_data.name[-3] = "Granular Layer";
allen_data.color[-3] = [0.7, 0.15, 0.15, 1.0];
allen_data.name[-4] = "Purkinje layer";
allen_data.color[-4] = [0.275, 0.800, 0.275, 1.0];
allen_data.name[-5] = "Molecular layer";
allen_data.color[-5] = [1, 0.647, 0, 1.0];
