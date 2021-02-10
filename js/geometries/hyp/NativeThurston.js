import {AbstractVRThurston} from "../../core/AbstractVRThurston.js";
import {VRRenderer} from "../../core/General.js";
import {NativeCamera} from "./cameras/native/NativeCamera.js";

/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class NativeThurston extends AbstractVRThurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the discrete subgroup
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, set, params = {}) {
        super(geom, set, NativeCamera, VRRenderer, params);
    }
}