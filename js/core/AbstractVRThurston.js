import {XRControllerModelFactory} from "../lib/threejs/examples/jsm/webxr/XRControllerModelFactory.js";
import {AbstractThurston} from "./AbstractThurston.js";
import {VRControlsMove} from "../controls/VRControlsMove.js";
import {VRControlsDrag} from "../controls/VRControlsDrag.js";
import {VRControlsReset} from "../controls/VRControlsReset.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class AbstractVRThurston extends AbstractThurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the teleportation set
     * @param {Function} cameraType - camera constructor
     * @param {Function} rendererType - renderer constructor
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, set, cameraType, rendererType, params = {}) {
        super(geom, set, cameraType, rendererType, params);

        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip0 = this.renderer.xr.getControllerGrip(0);
        const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        controllerGrip0.add(model0);
        this.renderer.threeScene.add(controllerGrip0);

        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        controllerGrip1.add(model1);
        this.renderer.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.renderer.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.renderer.threeScene.add(controller1);

        /**
         * Moving in the scene with the VR controller
         * @protected
         * @type {VRControlsMove}
         */
        this.VRControlsMove = new VRControlsMove(this.camera.position, controller0);
        /**
         * Rotating the scene with the VR controller
         * @protected
         * @type {VRControlsReset}
         */
        this.VRControlsDrag = new VRControlsReset(this.camera.position, controller1);
    }

    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();
        if (this.callback !== undefined) {
            this.callback();
        }
        this.flyControls.update(delta);
        this.VRControlsMove.update(delta);
        this.VRControlsDrag.update(delta);

        this.renderer.render();
        this.stats.update();
    }
}