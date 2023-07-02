import Stats from "stats";
import {GUI} from "dat.gui";
import {Clock, Color, Matrix4, Quaternion} from "three";
import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import {bind} from "../../../utils.js";

import {Isometry} from "../../../core/geometry/Isometry.js";
import {Vector} from "../../../core/geometry/Vector.js";
import {Scene, VRCamera, VRRenderer} from "../../../core/General.js";
import {MoveVRControls} from "../../../controls/vr/MoveVRControls.js";
import {DragVRControls} from "../../../controls/vr/DragVRControls.js";
import {ExpFog} from "../../scenes/expFog/ExpFog.js";
import {FlyControls} from "../../../controls/keyboard/FlyControls.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class ThurstonVRWoodBalls {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     * - {Solid} controller0 - the object representing the controller 0
     * - {Solid} controller1 - the object representing the controller 1
     */
    constructor(shader1, shader2, set, params = {}) {
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;

        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;

        /**
         * The non-euclidean camera
         * @type {VRCamera}
         */
        this.camera = params.camera !== undefined ? params.camera : new VRCamera({set: this.set});

        const fog = new ExpFog(new Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean renderer
         * @type {VRRenderer}
         */
        this.renderer = new VRRenderer(shader1, shader2, this.set, this.camera, this.scene, {}, {antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);


        /**
         * The keyboard controls
         * @type {FlyControls}
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new Clock();

        /**
         * The performance stats.
         * Setup when the renderer is built.
         * @type {Stats}
         */
        this.stats = undefined;

        /**
         * The graphical user interface.
         * Setup when the renderer is built.
         * @type {GUI}
         */
        this.gui = undefined;


        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip0 = this.renderer.xr.getControllerGrip(0);
        // const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        // controllerGrip0.add(model0);
        this.renderer.threeScene.add(controllerGrip0);
        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        // const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        // controllerGrip1.add(model1);
        this.renderer.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.renderer.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.renderer.threeScene.add(controller1);
        this._controllerOldMatrices = [undefined, undefined];
        this._controllerTextureInitialQuat = [undefined, undefined];
        this._controllerPositionCurrentQuat = [undefined, undefined];
        this._controllerUpdateRequired = true;
        this._cameraOldMatrix = new Matrix4();
        this._cameraTextureInitialQuat = undefined;
        this._cameraPositionCurrentQuat = undefined;
        this._cameraUpdateRequired = true;


        /**
         * Moving in the scene with the VR controller
         * @protected
         * @type {MoveVRControls}
         */
        this.VRControlsMove = new MoveVRControls(this.camera.position, controller0);
        /**
         * Rotating the scene with the VR controller
         * @protected
         * @type {DragVRControls}
         */
        this.VRControlsDrag = new DragVRControls(this.camera.position, controller1);


        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject0 = params.controllerObject0;
        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject1 = params.controllerObject1;
        /**
         * Object representing the camera in the scene.
         * type {Solid}
         */
        this.cameraObject = params.cameraObject;

        // add the controller to the scene.
        // if we are not in VR mode, these objects are not displayed.
        if (this.controllerObject0 !== undefined) {
            this.scene.add(this.controllerObject0);
            this.controllerObject0.isRendered = false;
        }
        if (this.controllerObject1 !== undefined) {
            this.scene.add(this.controllerObject1);
            this.controllerObject1.isRendered = false;
        }
        if (this.cameraObject !== undefined) {
            this.scene.add(this.cameraObject);
            this.cameraObject.isRendered = false;
        }


    }

    /**
     * Shortcut to get the controller target ray
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller target ray
     */
    getController(index) {
        return this.renderer.xr.getController(index);
    }

    /**
     * Shortcut to get the controller grip
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller grip
     */
    getControllerGrip(index) {
        return this.renderer.xr.getControllerGrip(index);
    }

    getControllerFull(index) {
        let object;
        switch (index) {
            case 0:
                object = this.controllerObject0;
                break;
            case 1:
                object = this.controllerObject1;
        }
        return {
            targetRay: this.renderer.xr.getController(index),
            grip: this.renderer.xr.getControllerGrip(index),
            object: object
        }
    }

    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
            }
        }, 'help').name("Help/About");

        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        cameraGUI.add(this.camera, 'fov', 45, 120)
            .name('Field of view');
        cameraGUI.add(this.camera, 'maxDist', 0, 100, 1)
            .name('Max distance');
        cameraGUI.add(this.camera, 'maxSteps', 20, 500, 1)
            .name('Max steps');
        cameraGUI.add(this.camera, 'threshold')
            .name('Threshold');

        return this;
    }

    /**
     * Initialize the performance stats
     * @return {Thurston} the current Thurston object
     */
    initStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        return this;
    }

    /**
     * Shortcut to add objects to the scene.
     * @param {...(Solid|Light)} obj - the objects to add
     */
    add(obj) {
        this.scene.add(/**@type {(Solid|Light)} */...arguments);
    }

    /**
     * Action when the window is resized.
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix();
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

        // updating the position / orientation of the camera
        if (this.cameraObject !== undefined) {
            if (this.camera.isStereoOn) {
                const matrix = this.camera.matrix.clone();
                this.cameraObject.isRendered = true;
                this.cameraObject.isom.copy(this.camera.position.local.boost);
                this.cameraObject.updateData();

                if (this._cameraUpdateRequired) {
                    this._cameraTextureInitialQuat = this.cameraObject.material.material.quaternion.clone();
                    this._cameraPositionCurrentQuat = new Quaternion().setFromRotationMatrix(matrix);
                    this._cameraUpdateRequired = false;
                } else {
                    const diffMatrix = new Matrix4()
                        .copy(this._cameraOldMatrix)
                        .invert()
                        .multiply(matrix);
                    this._cameraPositionCurrentQuat.multiply(
                        new Quaternion().setFromRotationMatrix(diffMatrix)
                    );
                    this.cameraObject.material.material.quaternion
                        .copy(this._cameraPositionCurrentQuat)
                        .multiply(this._cameraTextureInitialQuat);
                }

                this._cameraOldMatrix = matrix;

            } else {
                this._cameraUpdateRequired = true;
                this.cameraObject.isRendered = false;
            }
        }

        // updating the position / orientation of the controllers
        for (let i = 0; i < 2; i++) {
            const controllerFull = this.getControllerFull(i);
            if (controllerFull.object !== undefined) {
                if (this.camera.isStereoOn) {
                    controllerFull.object.isRendered = true;
                    // global position of the controller (in the real world)
                    const globalMatrix = controllerFull.targetRay.matrix.clone();
                    if (this._controllerUpdateRequired) {
                        // the VR mode has just been turned on
                        // update the position of the controller, relative to the camera
                        // position of the controller relative to the camera (in the real world)
                        const localMatrix = new Matrix4()
                            .copy(this.camera.matrix)
                            .invert()
                            .multiply(globalMatrix);
                        // update the position of the controller (in the geometry)
                        controllerFull.object.isom
                            .copy(this.camera.position.local.boost)
                            .multiply(new Isometry().makeTranslationFromDir(
                                new Vector().setFromMatrixPosition(localMatrix)
                            ));
                        // update the facing of the texture
                        // this is tricky, one has to multiply the rotation obainted by incrementation
                        // with the original rotation of the texture
                        // not sure how to mathematically justify this yet...
                        this._controllerTextureInitialQuat[i] = controllerFull.object.material.material.quaternion.clone();
                        this._controllerPositionCurrentQuat[i] = new Quaternion().setFromRotationMatrix(localMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i]);
                        this._controllerUpdateRequired = false;
                    } else {
                        // the VR was already on
                        // update the position of the controller relative to its previous location
                        const diffVector = new Vector()
                            .setFromMatrixPosition(this._controllerOldMatrices[i])
                            .negate()
                            .add(new Vector().setFromMatrixPosition(globalMatrix));
                        controllerFull.object.isom.multiply(new Isometry().makeTranslationFromDir(
                            diffVector
                        ));
                        const diffMatrix = new Matrix4()
                            .copy(this._controllerOldMatrices[i])
                            .invert()
                            .multiply(globalMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        this._controllerPositionCurrentQuat[i].multiply(
                            new Quaternion().setFromRotationMatrix(diffMatrix)
                        )
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i]);
                    }
                    this._controllerOldMatrices[i] = globalMatrix;
                    controllerFull.object.updateData();
                } else {
                    // an update of the controller position is needed next time the VR mode is turned on.
                    controllerFull.object.isRendered = false;
                    this._controllerUpdateRequired = true;
                }
            }
        }


        this.renderer.render();
        this.stats.update();
    }


    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.initStats();
        this.initGUI();
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}