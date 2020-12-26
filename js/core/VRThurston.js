import {AbstractThurston} from "./AbstractThurston.js";
import {StereoCamera, VRRenderer} from "./General.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class VRThurston extends AbstractThurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {Subgroup} subgroup - the discrete subgroup
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, subgroup, params = {}) {
        super(geom, subgroup, StereoCamera, VRRenderer, params);
    }
}