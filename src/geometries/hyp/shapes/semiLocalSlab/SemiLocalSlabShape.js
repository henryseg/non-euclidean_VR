import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";
import {default as set} from "../../groups/augmentedCube/set.js"

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Slab around the horizontal hyperbolic plane {z = 0}
 *
 * Only works with the `augmentedCube` teleportations set
 * The object is a "local" object associated to a finite index subgroup of the `cube` group, say G,
 * namely the kernel, say K, of the projection onto the dihedral group D6 implemented in `augmentedCube`
 */
export class SemiLocalSlabShape extends BasicShape {

    /**
     * Constructor.
     * The slab is the image by `isom` of the slab
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * - with the given thickness
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     * @param {number} thickness - the thickness of the slab
     */
    constructor(isom = undefined, thickness) {
        super(isom);
        this._normal = undefined;
        this.thickness = thickness;

        const shiftXp = set.teleportations[0].elt; // translation in the negative x direction (test if x > half width)
        const shiftXn = set.teleportations[1].elt; // translation in the positive x direction (test if x < -half width)
        const shiftYp = set.teleportations[2].elt; // translation in the negative y direction (test if y > half width)
        const shiftYn = set.teleportations[3].elt; // translation in the positive y direction (test if y < -half width)
        const shiftZp = set.teleportations[4].elt; // translation in the negative z direction (test if z > half width)
        const shiftZn = set.teleportations[5].elt; // translation in the positive z direction (test if z < -half width)

        // relation to turn around a vertical pillar :
        // (shiftYn * shiftZn * shiftXp) ^ 2
        // Its inverse is
        // (shiftXn * shiftZp * shiftYp) ^ 2

        const aux0 = set.group.element();
        const aux1 = aux0.clone().premultiply(shiftYp);
        const aux2 = aux1.clone().premultiply(shiftZp);
        const aux3 = aux2.clone().premultiply(shiftXn);
        const aux4 = aux3.clone().premultiply(shiftYp);
        const aux5 = aux4.clone().premultiply(shiftZp);

        const elts = [undefined, undefined, undefined, undefined, undefined, undefined];
        elts[aux0.hash()] = aux0;
        elts[aux1.hash()] = aux1;
        elts[aux2.hash()] = aux2;
        elts[aux3.hash()] = aux3;
        elts[aux4.hash()] = aux4;
        elts[aux5.hash()] = aux5;

        this.elt0 = elts[0];
        this.elt1 = elts[1];
        this.elt2 = elts[2];
        this.elt3 = elts[3];
        this.elt4 = elts[4];
        this.elt5 = elts[5];

        console.log(
            this.elt0.hash(),
            this.elt1.hash(),
            this.elt2.hash(),
            this.elt3.hash(),
            this.elt4.hash(),
            this.elt5.hash(),
        )
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal = {pos: pos, dir: dir};
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get isSemiLocalSlabShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'SemiLocalSlabShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return sdf(this);
    }

    glslGradient() {
        return gradient(this);
    }

    glslUVMap() {
        return uv(this);
    }
}