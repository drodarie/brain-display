import * as THREE from "three";

export class EventListener {
    constructor(camera, renderer)
    {
        this.camera = camera;
        this.renderer = renderer;

        this.offsetLeft = 0;
        this.offsetTop = 0;
        this.mouseV2 = new THREE.Vector2();
        this.mouse = {x:0, y:0};
        this.mouse_old = {x:0, y:0};
        this.zoom = 700.0;
        this.mouse_last = {x:0, y:0};
        this.mouse_speed= {x:0, y:0};
        this.mouse_is_down = [false,false,false,false,false,false,false,false,false,false];
        this.theta = 2.4;
        this.theta_old = 0.0;
        this.phi = 1.26;
        this.phi_old = 0.0;
        this.width = 800;
        this.height = 600;
    }

    onMouseMove(event) {
      if(event.clientX <= this.offsetLeft || this.width - event.clientX <= 0.0 || event.clientY <= this.offsetTop || this.height - event.clientY <= 0.0){
          this.mouse_is_down[0] = false;
          this.mouse_is_down[1] = false;
          this.mouse_is_down[2] = false;
      }

      this.mouseV2.x =  ( (-this.offsetLeft + event.clientX) / this.width ) * 2 - 1;
      this.mouseV2.y = -( (-this.offsetTop + event.clientY) / this.height ) * 2 + 1;
      this.mouse.x = event.layerX;
      this.mouse.y = event.layerY;
    }

    onMouseDown(event) {
        if( (event.button=== 0 || event.button=== 1 || event.button=== 2) && this.mouse_is_down[event.button] === false){
            this.mouse_old.x = this.mouse.x;
            this.mouse_old.y = this.mouse.y;
            this.theta_old = this.theta;
            this.phi_old = this.phi;
            this.camera.translation_old[0] = this.camera.translation[0];
            this.camera.translation_old[1] = this.camera.translation[1];
            this.camera.translation_old[2] = this.camera.translation[2];
        }
        this.mouse_is_down[event.button] = true;
    }
    onMouseUp(event) {
        this.mouse_is_down[event.button] = false;
    }

    onMouseWheel(event){
        this.zoom = this.zoom * (1 + Math.sign(event.deltaY) * 40.0 * 0.0015);
        if(this.zoom < 10.0) {
            this.zoom = 10.0;
        }
        if (this.zoom > 1300.0) {
            this.zoom = 1300.0;
        }
    }

    resizeRenderObjects(){

        update_point_sizes();
        initComposers();
    }

    onWindowResize() {
        this.width  = window.innerWidth - this.offsetLeft * 2;
        this.height = window.innerHeight - this.offsetTop * 2;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        // resizeRenderObjects();
    }

    init_interactions(container){
        this.offsetLeft = container.offsetLeft;
        this.offsetTop = container.offsetTop;
        this.onWindowResize();
        container.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        container.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        container.addEventListener('wheel', this.onMouseWheel.bind(this), false);
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    }

    update_camera() {
        if (this.mouse_is_down[1] || this.mouse_is_down[2]) {
            //this.camera.translation
            let dTr = this.zoom / 700.0;
            let Zvec = [
                this.camera.translation[0] - this.camera.glob_position[0],
                this.camera.translation[1] - this.camera.glob_position[1],
                this.camera.translation[2] - this.camera.glob_position[2]
            ];
            let Yvec = [-Zvec[2], 0.0, Zvec[0]];
            let YvecNorm = Math.sqrt(Yvec[0] * Yvec[0] + Yvec[1] * Yvec[1] + Yvec[2] * Yvec[2]);
            let Xvec = [
                Zvec[1] * Yvec[2] - Zvec[2] * Yvec[1],
                Zvec[2] * Yvec[0] - Zvec[0] * Yvec[2],
                Zvec[0] * Yvec[1] - Zvec[1] * Yvec[0]
            ];
            let XvecNorm = Math.sqrt(Xvec[0] * Xvec[0] + Xvec[1] * Xvec[1] + Xvec[2] * Xvec[2]);

            this.camera.translation[0] = this.camera.translation_old[0] - 0.5 * dTr * Yvec[0] * (this.mouse.x - this.mouse_old.x) / YvecNorm - 0.5 * dTr * Xvec[0] * (this.mouse.y - this.mouse_old.y) / XvecNorm;
            this.camera.translation[1] = this.camera.translation_old[1] - 0.5 * dTr * Yvec[1] * (this.mouse.x - this.mouse_old.x) / YvecNorm - 0.5 * dTr * Xvec[1] * (this.mouse.y - this.mouse_old.y) / XvecNorm;
            this.camera.translation[2] = this.camera.translation_old[2] - 0.5 * dTr * Yvec[2] * (this.mouse.x - this.mouse_old.x) / YvecNorm - 0.5 * dTr * Xvec[2] * (this.mouse.y - this.mouse_old.y) / XvecNorm;

        }
        else if (this.mouse_is_down[0]) {
            this.theta = this.theta_old + 0.0075 * (this.mouse.x - this.mouse_old.x);
            this.phi = this.phi_old - 0.0075 * (this.mouse.y - this.mouse_old.y);
        }
        if (this.phi > Math.PI) {
            this.phi = Math.PI - 0.0001;
        }
        if (this.phi < 0.0) {
            this.phi = 0.0001;
        }

        if (this.mouse_is_down[1]) {
            this.mouse_speed.x = this.mouse.x - this.mouse_last.x;
            this.mouse_speed.y = this.mouse.y - this.mouse_last.y;
        }
        this.mouse_last.x = this.mouse.x;
        this.mouse_last.y = this.mouse.y;

        this.camera.glob_position = [
            this.camera.translation[0] + this.zoom * Math.cos(this.theta) * Math.sin(this.phi),
            this.camera.translation[1] + this.zoom * Math.cos(this.phi),
            this.camera.translation[2] + this.zoom * Math.sin(this.theta) * Math.sin(this.phi)
        ];
        this.camera.position.set(
            this.camera.glob_position[0],
            this.camera.glob_position[1],
            this.camera.glob_position[2]
        );
		this.camera.lookAt( new THREE.Vector3(
            this.camera.translation[0],
            this.camera.translation[1],
            this.camera.translation[2]
        ));
		this.camera.updateProjectionMatrix();
    }
}
