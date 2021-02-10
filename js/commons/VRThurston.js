import {AbstractVRThurston} from "../core/AbstractVRThurston.js";
import {VRCamera, VRRenderer} from "../core/General.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class VRThurston extends AbstractVRThurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, set, params = {}) {
        super(geom, set, VRCamera, VRRenderer, params);
    }
}