import * as THREE from "three";
import {EventListener} from "@/store/interact.js";
import {Camera} from "@/store/camera.js";
import {CellPositions, color_mtypes} from "@/store/cells.js";
import {Shape} from "@/store/shape.js";


export class World {
    constructor() {
        this.loaded_meshes = {};
        this.points = null;
        this.selected = [-1, 0, 0]; // id point selected, original size and original alpha
        this.camera = new Camera( 40, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({alpha: false, preserveDrawingBuffer: true, antialias: false });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor( new THREE.Color("#000000"), 1 );
        // this.renderer.setClearColor( new THREE.Color("#FFFFFF"), 1 );
        this.renderer.sortObjects = true;
        this.updated = false;

        new Shape(
            -1, null, this.add_mesh.bind(this), [300, 200, 200],
            "io layer", color_mtypes.io, 100, [150.0, 350.0, 100.0], 0.5, true
        );
        new Shape(
            -2, null, this.add_mesh.bind(this), [300, 200, 200],
            "dcn layer", color_mtypes.dcn_p, 100, [150, 150, 100], 0.5, true
        );
        new Shape(
            -3, null, this.add_mesh.bind(this), [300, 130, 200],
            "granular layer", [0.7, 0.15, 0.15, 1.0], 100, [150, -50, 100], 0.5, true
        );
        new Shape(
            -4, null, this.add_mesh.bind(this), [300, 15, 200],
            "purkinje layer", color_mtypes.purkinje_cell, 100, [150, 350-530, 100], 0.5, true
        );
        new Shape(
            -4, null, this.add_mesh.bind(this), [300, 150, 200],
            "molecular layer", color_mtypes.basket_cell, 100, [150, 350-545, 100], 0.5, true
        );
        new CellPositions("src/assets/cereb-circuit/", this.add_points.bind(this), 600, 0.5, [150.0, 350.0, 100.0]);
        // new Shape(
        //     997,
        //     "src/assets/meshesMS/decimated_smoothed_mesh_997.obj",
        //     this.add_mesh.bind(this), null,
        //     "root", null, 400, [528.0/2, -320.0/2, 456.0/2]
        // );
        // new CellPositions("src/assets/mouse-brain/", this.add_points.bind(this));
        this.renderer.setAnimationLoop( this.animate.bind(this) );
        this.eventListener = new EventListener(this.camera, this.renderer);
    }

    init(container) {
        this.eventListener.init_interactions(container);
        this.renderer.render(this.scene, this.camera);
    }

    add_mesh(id, mesh){
        this.loaded_meshes[id] = mesh;
        this.scene.add( mesh );
        if (!this.updated){
            this.updated = true;
            mesh.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
        }
    }

    add_points(points){
        this.points = points;
        this.scene.add( points );
        points.onBeforeRender = function (renderer) { renderer.clearDepth(); };
    }

    click_on_points(){
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.eventListener.mouseV2, this.camera);

        let intersects = raycaster.intersectObjects( [this.points] );
        if(intersects.length>0) {
            let minDist = Infinity;
            let bestIdx = -1;
            for(let iintersects=0; iintersects < intersects.length; ++iintersects){
                    if(
                        intersects[iintersects].distance < minDist
                        && this.points.geometry.attributes.ex.array[intersects[iintersects].index]>0.5 // is point visible
                    ){
                        minDist = intersects[iintersects].distance;
                        bestIdx = intersects[iintersects].index;
                    }
                }
            if(this.selected[0] >=0) {
                // reset to old size and old alpha
                this.points.geometry.attributes.size.array[this.selected[0]] = this.selected[1];
                this.points.geometry.attributes.caA.array[this.selected[0]] = this.selected[2];
            }
            this.selected[0] = bestIdx;
            if(bestIdx >= 0){
                this.selected[2] = this.points.geometry.attributes.caA.array[bestIdx];
                this.selected[1] = this.points.geometry.attributes.size.array[bestIdx];
                this.points.geometry.attributes.size.array[bestIdx] *= 1.5;
                this.points.geometry.attributes.caA.array[bestIdx] = 2.0;
            }
            this.points.geometry.attributes.caA.needsUpdate = true;
            this.points.geometry.attributes.size.needsUpdate = true;
        }
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        this.eventListener.update_camera();
        for (let i in this.loaded_meshes){
            this.loaded_meshes[i].material.uniforms.camVx.value = this.camera.translation[0] - this.camera.glob_position[0];
            this.loaded_meshes[i].material.uniforms.camVy.value = this.camera.translation[1] - this.camera.glob_position[1];
            this.loaded_meshes[i].material.uniforms.camVz.value = this.camera.translation[2] - this.camera.glob_position[2];
        }
        if (this.points !== null){
            if (this.points.material !== undefined && this.points.material !==null) {
                this.points.material.uniforms.shaderZoom.value = this.eventListener.zoom;
            }
            this.click_on_points()
        }
        this.updated = false;
    }
}

