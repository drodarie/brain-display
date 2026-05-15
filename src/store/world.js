import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import {EventListener} from "@/store/interact.js";
import {Camera} from "@/store/camera.js";
import {CellPositions, color_mtypes} from "@/store/cells.js";
import {Shape} from "@/store/shape.js";
import {MeshBlendShader} from "@/store/shaders/MeshBlendShader.js";
import {AdditiveBlendShader} from "@/store/shaders/AdditiveBlendShader.js";
import {HorizontalBlurShader} from "@/store/shaders/HorizontalBlurShader.js";
import {VerticalBlurShader} from "@/store/shaders/VerticalBlurShader.js";


export class World {
    constructor() {
        this.loaded_meshes = {};
        this.points = null;
        this.selected = [-1, 0, 0]; // id point selected, original size and original alpha
        this.camera = new Camera( 40, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({alpha: false, preserveDrawingBuffer: true, antialias: false });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.sortObjects = true;
        this.updated = false;

        // Secondary scene/camera that mirrors the main scene; used as bloom source.
        this.scene2 = new THREE.Scene();
        this.camera2 = new Camera( 40, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.glowSc = 0.0;  // glow value of the points (meshes should be unaffected)
        this._init_composers();

        this.light_background = true;  // By default, will be dark because of toggle.
        this.toggle_background_color();

        this.renderer.setAnimationLoop( this.animate.bind(this) );
        this.eventListener = new EventListener(this.camera, this.renderer);
    }

    set_glowSc(v) {
        this.glowSc = v;
        if (this.vertBlur) this.vertBlur.uniforms.glowSc.value = v;
    }

    _init_composers() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // composer2 renders scene2 then blurs it (H then V). Output lives in composer2.renderTarget2.
        this.composer2 = new EffectComposer(this.renderer);
        this.composer2.renderToScreen = false;
        this.composer2.addPass(new RenderPass(this.scene2, this.camera2));

        this.horizBlur = new ShaderPass(HorizontalBlurShader);
        this.vertBlur = new ShaderPass(VerticalBlurShader);
        this.horizBlur.uniforms.h.value = 2.0 / w;
        this.vertBlur.uniforms.v.value = 2.0 / h;
        this.vertBlur.uniforms.glowSc.value = this.glowSc;
        this.composer2.addPass(this.horizBlur);
        this.composer2.addPass(this.vertBlur);

        // finalComposer renders the main scene then additively blends with composer2's output.
        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.addPass(new RenderPass(this.scene, this.camera));
        this.blendPass = new ShaderPass(AdditiveBlendShader, "tDiffuse1");
        this.blendPass.uniforms.tDiffuse2.value = this.composer2.renderTarget2.texture;
        this.finalComposer.addPass(this.blendPass);

        this.composer2.setSize(w, h);
        this.finalComposer.setSize(w, h);
    }

    _on_resize() {
        const size = new THREE.Vector2();
        this.renderer.getSize(size);
        this.composer2.setSize(size.x, size.y);
        this.finalComposer.setSize(size.x, size.y);
        this.horizBlur.uniforms.h.value = 2.0 / size.x;
        this.vertBlur.uniforms.v.value = 2.0 / size.y;
        this.blendPass.uniforms.tDiffuse2.value = this.composer2.renderTarget2.texture;
    }

    toggle_background_color(){
        // switch background_color between white and black
        this.light_background = !this.light_background;
        let col = Number(this.light_background); // 1 or 0
        this.renderer.setClearColor( new THREE.Color(col, col, col), 1 );
        MeshBlendShader.uniforms.totRGB.value = col;
        for (let i in this.loaded_meshes) {
            let mesh = this.loaded_meshes[i][0];
            if (!mesh.is_root){
                for (let j = 0; j < mesh.geometry.attributes.caR.array.length; j++) {
                    mesh.geometry.attributes.caR.array[j] = 1.0 - mesh.geometry.attributes.caR.array[j];
                    mesh.geometry.attributes.caG.array[j] = 1.0 - mesh.geometry.attributes.caG.array[j];
                    mesh.geometry.attributes.caB.array[j] = 1.0 - mesh.geometry.attributes.caB.array[j];
                }
                mesh.geometry.needsUpdate = true;
            }
            mesh.material.uniforms.totRGB.value = col;
            mesh.material.needsUpdate = true;
        }
        const inv = this.light_background ? -1.0 : 1.0;
        this.horizBlur.uniforms.inv.value = inv;
        this.blendPass.uniforms.inv.value = inv;
    }

    init(container) {
        container.appendChild(this.renderer.domElement);
        this.eventListener.init_interactions(container);
        window.addEventListener('resize', this._on_resize.bind(this), false);
        this._on_resize();
    }

    render_whole_brain() {
        const c = this.get_root_color();
        new Shape(
            997,
            "src/assets/meshesMS/decimated_smoothed_mesh_997.obj",
            this.add_mesh.bind(this), null,
            "root", [c, c, c],
            400, [528.0/2, -320.0/2, 456.0/2],
            1.0, false, true, this.light_background
        );
        new CellPositions("src/assets/mouse-brain/", this.add_points.bind(this));
    }

    render_column(){
        new Shape(
                -1, null, this.add_mesh.bind(this), [300, 200, 200],
                "io layer", color_mtypes.io, 100, [150.0, 350.0, 100.0], 0.5,
            false, false, this.light_background
            );
        new Shape(
            -2, null, this.add_mesh.bind(this), [300, 200, 200],
            "dcn layer", color_mtypes.dcn_p, 100, [150, 150, 100], 0.5,
            false, false, this.light_background
        );
        new Shape(
            -3, null, this.add_mesh.bind(this), [300, 130, 200],
            "granular layer", [0.7, 0.15, 0.15, 1.0], 100, [150, -50, 100], 0.5,
            false, false, this.light_background
        );
        new Shape(
            -4, null, this.add_mesh.bind(this), [300, 15, 200],
            "purkinje layer", color_mtypes.purkinje_cell, 100, [150, 350-530, 100], 0.5,
            false, false, this.light_background
        );
        new Shape(
            -5, null, this.add_mesh.bind(this), [300, 150, 200],
            "molecular layer", color_mtypes.basket_cell, 100, [150, 350-545, 100], 0.5,
            false, false, this.light_background
        );
        new CellPositions("src/assets/cereb-circuit/", this.add_points.bind(this), 600, 0.5,
            [150.0, 350.0, 100.0]);
    }

    add_mesh(id, mesh, is_root){
        this.loaded_meshes[id] = [mesh, is_root];
        this.scene.add( mesh );
        if (!this.updated){
            this.updated = true;
            mesh.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
        }
    }

    add_points(points){
        this.points = points;
        this.scene.add( points );
        this.scene2.add( points.clone() );
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

    get_root_color(){
        return 0.6 * (1.0 - Math.exp(-(this.eventListener.zoom - 450.0) * 0.0030));
    }

    animate() {
        let has_updated = this.eventListener.update_camera();
        if (has_updated) {
            // Mirror the main camera into camera2 so scene2 (bloom source) renders from the same POV.
            this.camera2.position.copy(this.camera.position);
            this.camera2.quaternion.copy(this.camera.quaternion);
            this.camera2.fov = this.camera.fov;
            this.camera2.aspect = this.camera.aspect;
            this.camera2.near = this.camera.near;
            this.camera2.far = this.camera.far;
            this.camera2.updateProjectionMatrix();
            for (let i in this.loaded_meshes) {
                let mesh = this.loaded_meshes[i][0];
                mesh.material.uniforms.camVx.value = this.camera.translation[0] - this.camera.glob_position[0];
                mesh.material.uniforms.camVy.value = this.camera.translation[1] - this.camera.glob_position[1];
                mesh.material.uniforms.camVz.value = this.camera.translation[2] - this.camera.glob_position[2];
                if (this.loaded_meshes[i][1]) {
                    // root mesh color is based on zoom.
                    let color = 0.6 * (1.0 - Math.exp(-(this.eventListener.zoom - 450.0) * 0.0030));
                    for (let j = 0; j < mesh.geometry.attributes.caR.array.length; j++) {
                        mesh.geometry.attributes.caR.array[j] = color;
                        mesh.geometry.attributes.caG.array[j] = color;
                        mesh.geometry.attributes.caB.array[j] = color;
                    }
                    mesh.geometry.attributes.caR.needsUpdate = true;
                    mesh.geometry.attributes.caG.needsUpdate = true;
                    mesh.geometry.attributes.caB.needsUpdate = true;
                }
            }
            if (this.points !== null) {
                if (this.points.material !== undefined && this.points.material !== null) {
                    this.points.material.uniforms.shaderZoom.value = this.eventListener.zoom;
                }
            }
        }
        if (this.points !== null){
            this.click_on_points();
        }
        this.composer2.render();
        this.finalComposer.render();
        this.updated = false;
    }
}

