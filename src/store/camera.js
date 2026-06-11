import * as THREE from "three";

export class Camera extends THREE.PerspectiveCamera{

    constructor( fov = 40, aspect = 1, near = 0.1, far = 1500) {
        super(fov, aspect, near, far);
        this.reset_translation();
        this.set_position();
    }

    set_position(zoom=700., phi= 1.26, theta= 2.4) {
        if (!this.glob_position) this.glob_position = new THREE.Vector3();
        this.glob_position.set(
            zoom * Math.cos(theta) * Math.sin(phi) + this.translation.x,
            zoom * Math.cos(phi) + this.translation.y,
            zoom * Math.sin(theta) * Math.sin(phi) + this.translation.z
        );
    }

    reset_translation(center = new THREE.Vector3()){
        this.translation = center.clone();
        this.translation_old = center.clone();
    }
}
