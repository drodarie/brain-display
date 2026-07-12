import * as THREE from "three";
import {PointShader} from "@/store/shaders/PointShader.js";
import {allen_data} from "@/store/allen_atlas.js";

export let SphereTypes = {
    "sphere": 1,
    "circle": 2,
    "blended": 3,
};

export let Colormaps = {
    "regions": "areaSIM.raw",
    "orientations": "areaSIM.raw",
    "types": "typeSIM.raw",
    "mtypes": "cellTypesSIM.raw",
};

export let id_types = {0: "inh", 1: "exc"};

export let color_types = {
    inh: [1.0, 0.0, 0.0],
    exc: [0.0, 0.4, 1.0],
    pv: [1.0, 0.0, 0.5],
    sst: [1.0, 1.0, 0.0],
    vip: [1.0, 0.5, 0.0],
    mod: [1.0, 0.0, 1.0],
    oligo: [0.6, 0.8, 0.0],
    astro: [0.0, 0.6, 0.0],
    micro: [0.0, 0.8, 0.6]
};

let id_mtypes = {
    0: 'basket_cell', 1: 'dcn_i', 2: 'dcn_p', 3: 'io',
    4: 'glomerulus', 5: 'golgi_cell', 6: 'granule_cell',
    7: 'mossy_fibers', 8: 'purkinje_cell', 9: 'stellate_cell',
    10: 'ubc_glomerulus', 11: 'unipolar_brush_cell'
};


export let color_mtypes = {
    mossy_fibers: [0.847, 0, 0.451, 1.0],
    glomerulus: [0.847, 0, 0.451, 1.0],
    granule_cell: [0.7, 0.15, 0.15, 0.5],
    ascending_axon: [0.7, 0.15, 0.15, 0.5],
    parallel_fiber: [0.7, 0.15, 0.15, 0.5],
    unipolar_brush_cell: [0.196, 0.808, 0.988, 1.0],
    ubc_glomerulus: [0.196, 0.808, 0.988, 1.0],
    golgi_cell: [0, 0.45, 0.7, 1.0],
    purkinje_cell: [0.275, 0.800, 0.275, 1.0],
    purkinje_cell_minus: [0.275, 0.550, 0.275, 1.0],
    basket_cell: [1, 0.647, 0, 1.0],
    stellate_cell: [1, 0.84, 0, 1.0],
    dcn_p: [0.3, 0.3, 0.3, 1.0],
    dcn_p_plus: [0.3, 0.3, 0.3, 1.0],
    dcn_p_minus: [0.1, 0.1, 0.1, 1.0],
    dcn_i: [0.635, 0, 0.145, 1.0],
    dcn_i_plus: [0.635, 0, 0.145, 1.0],
    dcn_i_minus: [0.435, 0, 0.145, 1.0],
    io: [0.46, 0.376, 0.54, 1.0],
    io_plus: [0.46, 0.376, 0.54, 1.0],
    io_minus: [0.76, 0.276, 0.74, 1.0]
};

export class CellPositions {
    constructor(folder, callback, z_order = 999,
                sc = 1.0 / 25.0,
                color_map = Colormaps.regions,
                radius_scale = 5.0,
                offset = [0.0, 0.0, 0.0],
                dark_background = true) {
        this.size = (window.innerHeight / 800.0);  // original scale of the points radius
        this.sc = sc;  // scale of the positions coordinates
        this.offset = offset;
        this.geometry = null;
        this.mesh = null;
        this.color_map = color_map;
        this.radius_scale = radius_scale; // scale factor of the points radius (can be changed by the user)
        this.z_order = z_order;
        this.callback = callback;
        this.folder = folder;
        this.dark_background = dark_background;
        this.sphere_type = SphereTypes.blended;
        this._colormap_data = null;
        this.open_points(folder + "positionsSIM.raw");
    }

    load_points(event) {
        let arrayBuffer = event.currentTarget.response;
        let vertices_ = [];

        if (arrayBuffer.byteLength % 12 === 0) {
            let byteArray = new Float32Array(arrayBuffer);

            for (let i = 0; i < byteArray.length; i = i + 3) {
                vertices_.push(this.sc * (byteArray[i] - this.offset[0]));
                vertices_.push(this.sc * (byteArray[i + 1] - this.offset[1]));
                vertices_.push(this.sc * (byteArray[i + 2] - this.offset[2]));
            }

            let textured = new Array(vertices_.length/3).fill(0.5);
            let ex = new Array(vertices_.length/3).fill(1);  // visible or not
            let size = new Array(vertices_.length/3).fill(this.size * this.radius_scale);

            let caR = new Array(vertices_.length/3).fill(1.0);
            let caG = new Array(vertices_.length/3).fill(1.0);
            let caB = new Array(vertices_.length/3).fill(1.0);
            let caA = new Array(vertices_.length/3).fill(0.209);

            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices_, 3));
            this.geometry.setAttribute("textured", new THREE.Float32BufferAttribute(textured, 1).setUsage( THREE.DynamicDrawUsage ));
            this.geometry.setAttribute("ex", new THREE.Uint8BufferAttribute(ex, 1).setUsage( THREE.DynamicDrawUsage ));
            this.geometry.setAttribute("size", new THREE.Float32BufferAttribute(size, 1).setUsage( THREE.DynamicDrawUsage ));

            this.geometry.setAttribute("caR", new THREE.Float32BufferAttribute(caR, 1).setUsage( THREE.DynamicDrawUsage ));
            this.geometry.setAttribute("caG", new THREE.Float32BufferAttribute(caG, 1).setUsage( THREE.DynamicDrawUsage ));
            this.geometry.setAttribute("caB", new THREE.Float32BufferAttribute(caB, 1).setUsage( THREE.DynamicDrawUsage ));
            this.geometry.setAttribute("caA", new THREE.Float32BufferAttribute(caA, 1).setUsage( THREE.DynamicDrawUsage ));
            this.mesh = new THREE.Points(
                this.geometry,
                new THREE.ShaderMaterial({
                    uniforms: PointShader.uniforms,
                    vertexShader: PointShader.vertexShader,
                    fragmentShader: PointShader.fragmentShader,
                    blending: THREE.AdditiveBlending,
                    depthTest: false,
                    transparent: true,
                })
            );
            this.mesh.dynamic = true;
            this.mesh.renderOrder = this.z_order;
            this.load_colormap(this.color_map);
            this.load_radii();
            this.callback(this.mesh);
        }
        else {
            console.error(`Size of position array loaded from file: (${arrayBuffer.byteLength} bytes) is not a multiple of 12. Expected trios of float32.`);
        }
    }

    change_sphere_type(sphere_type, dark_background = true){
        this.sphere_type = sphere_type;
        this.dark_background = dark_background;
        if(this.geometry !== null && this.mesh !== null){
            if(sphere_type === SphereTypes.sphere){
                for (let i = 0; i < this.geometry.attributes.textured.array.length; i ++ ) {
                    this.geometry.attributes.caA.array[i] = 1.0;
                    this.geometry.attributes.textured.array[ i ] = 1.0;
                }
                this.mesh.material.blending = THREE.NormalBlending;
                this.mesh.material.depthTest = true;
                this.mesh.material.transparent = false;
            }else if(sphere_type === SphereTypes.blended){
                for (let i = 0; i < this.geometry.attributes.textured.array.length; i ++ ) {
                    this.geometry.attributes.caA.array[i] = 0.209;
                    this.geometry.attributes.textured.array[ i ] = 0.5;
                }
                this.mesh.material.blending = dark_background ? THREE.AdditiveBlending : THREE.SubtractiveBlending;
                this.mesh.material.depthTest = false;
                this.mesh.material.transparent = true;
            }else if(sphere_type === SphereTypes.circle){
                for( var i = 0; i < this.geometry.attributes.textured.array.length; i ++ ) {
                    this.geometry.attributes.caA.array[i] = 1.0;
                    this.geometry.attributes.textured.array[ i ] = 0.0;
                }
                this.mesh.material.blending = THREE.NormalBlending;
                this.mesh.material.depthTest = true;
                this.mesh.material.transparent = false;
            }
            if(this.spike_times!==undefined){
                this.reset_colors();
            }
            this.geometry.attributes.caA.needsUpdate = true;
            this.geometry.attributes.textured.needsUpdate = true;
            this.mesh.material.needsUpdate = true;
            this._apply_point_colors();
        }
    }

    get_color(point) {
        let clr = [0.5,0.5,0.5];
        if(this.color_map === Colormaps.regions || this.color_map === Colormaps.orientations) {
            clr = allen_data.color[point]!== undefined ? allen_data.color[point].slice() : [130.0, 130.0, 130.0];
        }
        else if (this.color_map === Colormaps.types) {
            clr = color_types[id_types[point]]!== undefined ? color_types[id_types[point]].slice() : [0.5, 0.5, 0.5];
        }
        else if (this.color_map === Colormaps.mtypes){
            clr = color_mtypes[id_mtypes[point]]!== undefined ? color_mtypes[id_mtypes[point]].slice() : [0.5, 0.5, 0.5];
        }
        return clr;
    }

    update_point_colors(event){
        var arrayBuffer = event.currentTarget.response;
        if (arrayBuffer && this.geometry !== null) {
            this._colormap_data = new Int16Array(arrayBuffer);
            this._apply_point_colors();
        }
    }

    _apply_point_colors(){
        if (!this._colormap_data || !this.geometry) return;
        const invert = !this.dark_background && this.sphere_type === SphereTypes.blended;
        this._baseColor = {
            R: new Float32Array(this._colormap_data.length),
            G: new Float32Array(this._colormap_data.length),
            B: new Float32Array(this._colormap_data.length),
        };
        for (let i = 0; i < this._colormap_data.length; i++) {
            let clr = this.get_color(parseInt(this._colormap_data[i]));
            if (invert) { clr[0] = 1.0 - clr[0]; clr[1] = 1.0 - clr[1]; clr[2] = 1.0 - clr[2]; }
            this._baseColor.R[i] = clr[0];
            this._baseColor.G[i] = clr[1];
            this._baseColor.B[i] = clr[2];
            this.geometry.attributes.caR.array[i] = clr[0];
            this.geometry.attributes.caG.array[i] = clr[1];
            this.geometry.attributes.caB.array[i] = clr[2];
        }
        this.geometry.attributes.caR.needsUpdate = true;
        this.geometry.attributes.caG.needsUpdate = true;
        this.geometry.attributes.caB.needsUpdate = true;
        this.geometry.attributes.caA.needsUpdate = true;
    }

    set_point_radii(event) {
        var arrayBuffer = event.currentTarget.response;
        if (arrayBuffer.byteLength % 4 === 0 && this.geometry !== null) {
            let byteArrayTMP = new Float32Array(arrayBuffer);
            for (let i = 0; i < byteArrayTMP.length; i = i + 1) {
                this.geometry.attributes.size.array[i] = this.size * this.radius_scale * parseFloat(byteArrayTMP[i]);
            }
            this.geometry.attributes.size.needsUpdate = true;
        }
    }

    update_radius_scale(radius_scale){
        if (!this.geometry) return;
        for (let i = 0; i < this.geometry.attributes.size.array.length; i++) {
            this.geometry.attributes.size.array[i] = this.geometry.attributes.size.array[i] / this.radius_scale * radius_scale;
        }
        this.geometry.attributes.size.needsUpdate = true;
        this.radius_scale = radius_scale;
    }


    open_points(address_){
        let requestPOINTS = new XMLHttpRequest();
        requestPOINTS.open('GET', address_, true );
        requestPOINTS.responseType = "arraybuffer";
        requestPOINTS.addEventListener('load', this.load_points.bind(this), false);
        requestPOINTS.send(null);
    }

    load_colormap(color_map){
        this.color_map = color_map;
        let requestNEUPARA = new XMLHttpRequest();
        requestNEUPARA.open( 'GET', this.folder + color_map, true );
        requestNEUPARA.responseType = "arraybuffer";
        requestNEUPARA.addEventListener( 'load', this.update_point_colors.bind(this), false);
        requestNEUPARA.send(null);
    }

    load_radii(){
        let requestNEUPARA = new XMLHttpRequest();
        requestNEUPARA.open( 'GET', this.folder + "radiusSIM.raw", true );
        requestNEUPARA.responseType = "arraybuffer";
        requestNEUPARA.addEventListener( 'load', this.set_point_radii.bind(this), false);
        requestNEUPARA.send(null);
    }

    get_spike_times(event) {
        var arrayBuffer = event.currentTarget.response;
        this.spike_times = [];
        this.spike_senders = [];
        this.spikeIndex = 0;
        // Each spike is a (time, sender_id) pair: 2 × float32 = 8 bytes
        if (arrayBuffer.byteLength % 8 === 0) {
            let byteArrayTMP = new Float32Array(arrayBuffer);
            for (let i = 0; i < byteArrayTMP.length; i = i + 2) {
                this.spike_times.push(byteArrayTMP[i]);
                this.spike_senders.push(~~byteArrayTMP[i + 1]);  // convert to int
            }
        } else {
            console.error(`Spike file size (${arrayBuffer.byteLength} bytes) is not a multiple of 8. Expected pairs of float32.`);
        }
        if (this.spike_times.length > 0){
            let timeNow =  new Date().getTime();
            this.lastSpikeUpdateTime = timeNow;
            this.refTimeSpikes = timeNow;
            if (this._sim_callback) this._sim_callback();
        }
    }

    load_simulation(simulation, callback) {
        this._sim_callback = callback || null;
        let requestSim = new XMLHttpRequest();
        requestSim.open( 'GET', this.folder + simulation + "_spikes.raw", true );
        requestSim.responseType = "arraybuffer";
        requestSim.addEventListener( 'load', this.get_spike_times.bind(this), false);
        requestSim.send(null);
    }

    update_simulation(num_s_per_s= 0.01, tauDecay= 1.0){
        if (this.spike_times === undefined || this.spike_times.length === 0) return false;
        if (this.spikeIndex >= this.spike_times.length) return false;

        let timeNow = new Date().getTime();
        let simTimeNow = (timeNow - this.refTimeSpikes) * num_s_per_s;
        let simTimeLastUpdate = this.get_elapsed_sim_time(num_s_per_s);

        // decay color of all points back towards their base (region) color
        let decayScaler = Math.exp(-(simTimeNow - simTimeLastUpdate) / tauDecay);

        let caR = this.geometry.attributes.caR.array;
        let caG = this.geometry.attributes.caG.array;
        let caB = this.geometry.attributes.caB.array;
        let caA = this.geometry.attributes.caA.array;
        if (this.sphere_type === SphereTypes.blended){
            for (let v = 0; v < caA.length; v++) {
                caA[v] *= decayScaler;
                caA[v] = Math.max(0.1, caA[v]);
            }
        }
        else {
            let baseR = this._baseColor.R;
            let baseG = this._baseColor.G;
            let baseB = this._baseColor.B;

            for (let v = 0; v < caR.length; v++) {
                caR[v] = baseR[v] + (caR[v] - baseR[v]) * decayScaler;
                caG[v] = baseG[v] + (caG[v] - baseG[v]) * decayScaler;
                caB[v] = baseB[v] + (caB[v] - baseB[v]) * decayScaler;
            }
        }

        // light up neurons whose spike falls in (simTimeLastUpdate, simTimeNow] in white
        while (this.spikeIndex < this.spike_times.length &&
               this.spike_times[this.spikeIndex] <= simTimeNow) {
            if (this.spike_times[this.spikeIndex] > simTimeLastUpdate) {
                let sender = this.spike_senders[this.spikeIndex];
                if (this.sphere_type === SphereTypes.blended){
                    caA[sender] = 1.0;
                }
                else{
                    caR[sender] = 1.0;
                    caG[sender] = 1.0;
                    caB[sender] = 1.0;
                }
            }
            this.spikeIndex++;
        }
        if (this.spikeIndex >= this.spike_times.length) { // end of simulation
            this.stop_simulation();
        }
        this.geometry.attributes.caR.needsUpdate = true;
        this.geometry.attributes.caG.needsUpdate = true;
        this.geometry.attributes.caB.needsUpdate = true;
        this.geometry.attributes.caA.needsUpdate = true;
        this.lastSpikeUpdateTime = timeNow;
        return true;
    }

    reset_colors(){
        if (this._baseColor) {
            this.geometry.attributes.caR.array.set(this._baseColor.R);
            this.geometry.attributes.caG.array.set(this._baseColor.G);
            this.geometry.attributes.caB.array.set(this._baseColor.B);
            this.geometry.attributes.caR.needsUpdate = true;
            this.geometry.attributes.caG.needsUpdate = true;
            this.geometry.attributes.caB.needsUpdate = true;
        }
    }

    stop_simulation(){
        if (this.spike_times === undefined) return;
        // reset colors to their base (region) color
        this.reset_colors();
        let old_caA = this.sphere_type === SphereTypes.blended ? 0.209: 1.0;
        for (let v = 0; v < this.geometry.attributes.caA.array.length; v++) {
            this.geometry.attributes.caA.array[v] = old_caA;
        }
        // free memory
        this.spike_times = undefined;
        this.spike_senders = undefined;
        this.geometry.attributes.caA.needsUpdate = true;
    }

    resume_simulation(){
        // Shift both references forward by the paused duration so elapsed sim time excludes the pause.
        let timeNow = new Date().getTime();
        let delay = timeNow - this.lastSpikeUpdateTime;
        this.refTimeSpikes += delay;
        this.lastSpikeUpdateTime = timeNow;
    }

    get_total_sim_time(){
        return (this.spike_times !== undefined && this.spike_times.length > 0)
            ? this.spike_times[this.spike_times.length - 1] : 0;
    }

    get_elapsed_sim_time(num_s_per_s){
        if (this.spike_times === undefined) return 0;
        return (this.lastSpikeUpdateTime - this.refTimeSpikes) * num_s_per_s;
    }
}