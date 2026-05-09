import * as THREE from "three";
import {MeshBlendShader} from "@/store/shaders/MeshBlendShader.js";
import {allen_data} from "@/store/allen_atlas.js";

export class Shape {
    constructor(id, filename, callback, size = null,
                name= null, color= null, z_order = 100,
                offset = [528.0, 320.0, 456.0], scale = 1.0,
                blended= false) {
        this.id = id;
        if (name !== null){
            this.name = name;
        }
        else{
            this.name = (this.id in allen_data.name) ? allen_data.name[this.id] : "shape";
        }

        if (color !== null){
            this.color = color;
        }
        else{
            this.color = (this.id in allen_data.color) ? allen_data.color[this.id] : allen_data.color[997];
        }
        this.offset = offset;
        this.scale = scale;
        this.geometry = null;
        this.mesh = null;
        this.z_order = z_order;
        this.blended = blended;
        this.callback = callback;
        if (filename !== null){
            this.size = [0, 0, 0];
            this.open_mesh(filename);
        }
        else{
            this.size = (size !== null) ? size : [300, 700, 200];
            this.init_cube();
        }
    }

    parse_mesh_str(mesh_str){
        let vertices_ = [];
        let indices_ = [];
        for ( var i = 0; i < mesh_str.length; i++ ) {
            if(mesh_str[i][0] === "v" && mesh_str[i][1] === " "){
                let mesh_str_spl = mesh_str[i].split(" ");
                let x_ = this.scale * (parseFloat(mesh_str_spl[1]));
                let y_ = - this.scale * (parseFloat(mesh_str_spl[2]));
                let z_ = this.scale * (parseFloat(mesh_str_spl[3]));
                vertices_.push( x_ );
                vertices_.push( y_ );
                vertices_.push( z_ );
            }
            if(mesh_str[i][0] === "f"){
                let mesh_str_spl = mesh_str[i].split(" ");
                indices_.push(parseInt(mesh_str_spl[1].split("/")[0]) - 1);
                indices_.push(parseInt(mesh_str_spl[2].split("/")[0]) - 1);
                indices_.push(parseInt(mesh_str_spl[3].split("/")[0]) - 1);
            }
        }

        return [vertices_, indices_];
    }
    
    change_mesh_blending(){
        if(this.mesh !== null && this.id !== 997){
            // for every other mesh than the external brain mesh / root mesh
            if(this.blended){
                this.mesh.material.blending = THREE.AdditiveBlending;
                this.mesh.material.depthTest = false;
                this.mesh.material.transparent = true;
            }
            else{
                this.mesh.material.blending = THREE.NormalBlending;
                this.mesh.material.depthTest = true;
                this.mesh.material.transparent = false;
            }
        }
    }

    create_mesh(){
        this.mesh = new THREE.Mesh(
            this.geometry,
            new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(MeshBlendShader.uniforms),
                vertexShader: MeshBlendShader.vertexShader,
                fragmentShader: MeshBlendShader.fragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                transparent: false,
                side: THREE.DoubleSide,
            })
        );
        this.mesh.position.set(
            (-this.offset[0] + this.size[0] / 2) * this.scale,
            (-this.offset[1] + this.size[1] / 2) * this.scale,
            (-this.offset[2] + this.size[2] / 2) * this.scale
        );
        this.mesh.dynamic = true;
        this.mesh.material.visible = true;
        this.mesh.renderOrder = this.z_order;
        this.mesh.geometry.computeVertexNormals();

        this.change_mesh_blending();
        this.callback(this.id, this.mesh);
    }

    init_cube() {
        this.geometry = new THREE.BoxGeometry( this.scale * this.size[0], this.scale * this.size[1], this.scale * this.size[2] );

        this.geometry.setAttribute( "caR", new THREE.Float32BufferAttribute(new Array(24).fill(this.color[0]), 1).setUsage( THREE.DynamicDrawUsage ));
        this.geometry.setAttribute( "caG", new THREE.Float32BufferAttribute(new Array(24).fill(this.color[1]), 1).setUsage( THREE.DynamicDrawUsage ));
        this.geometry.setAttribute( "caB", new THREE.Float32BufferAttribute(new Array(24).fill(this.color[2]), 1).setUsage( THREE.DynamicDrawUsage ));
        this.create_mesh();
    }

    load_mesh(event){
        var resURLsplitMESH = event.currentTarget.responseURL.split("_");
        var meshID = resURLsplitMESH[resURLsplitMESH.length-1].split(".")[0];
        if (!isNaN(parseInt(meshID))){
            this.id = parseInt(meshID);
        }

        let mesh_str = event.target.responseText.split('\n');
        let res = this.parse_mesh_str(mesh_str);
        let vertices_= res[0];
        let indices_= res[1];

        let caR = new Array(vertices_.length/3).fill(this.color[0]);
        let caG = new Array(vertices_.length/3).fill(this.color[1]);
        let caB = new Array(vertices_.length/3).fill(this.color[2]);
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices_, 3)  );
        this.geometry.setIndex( indices_ );
        this.geometry.setAttribute(
            "caR",
            new THREE.Float32BufferAttribute( caR, 1).setUsage( THREE.DynamicDrawUsage )
        );
        this.geometry.setAttribute(
            "caG",
            new THREE.Float32BufferAttribute( caG, 1).setUsage( THREE.DynamicDrawUsage )
        );
        this.geometry.setAttribute(
            "caB",
            new THREE.Float32BufferAttribute( caB, 1).setUsage( THREE.DynamicDrawUsage )
        );

        this.create_mesh();
    }

    open_mesh(address_){
        let requestMESH = new XMLHttpRequest();
        requestMESH.open( 'GET', address_, true );
        requestMESH.overrideMimeType("text/plain; charset=x-user-defined");
        requestMESH.addEventListener( 'load', this.load_mesh.bind(this), false );
        requestMESH.send( null );
    }
}