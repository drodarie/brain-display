import * as THREE from "three";

export class Camera extends THREE.PerspectiveCamera{

    constructor( fov = 40, aspect = 1, near = 0.1, far = 1500 ) {
        super(fov, aspect, near, far);
        this.translation = [0.0, 0.0, 0.0];
        this.translation_old = [0.0, 0.0, 0.0];
        this.glob_position = [
            700.0 * Math.cos(2.4) * Math.sin(1.26),
            700.0 * Math.cos(1.26),
            700.0 * Math.sin(2.4) * Math.sin(1.26)
        ];

    }
}