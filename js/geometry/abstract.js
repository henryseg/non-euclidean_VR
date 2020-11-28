/**
 * @module Abstract geometry
 *
 * @description
 * Defines the objects required by each geometry.
 * Handle the geometry independent part of those objects.
 * The geometry dependent part is done in specific module.
 *
 * For each geometry one needs to choose:
 * - an origin
 * - a reference frame in the tangent space at the origin
 * (see paper)
 */

import {
    Vector3,
    Vector4,
    Matrix4
} from "../lib/three.module.js"

import {
    mustache
} from "../lib/mustache.mjs";


/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Abstract geometry';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'geometry/model.glsl';

/**
 * Add a method to numbers.
 * Convert the number to a string, with an additional dot, to be considered as float by GLSL.
 * @return {string} the converted number
 */
Number.prototype.toGLSL = function () {
    let res = this.toString();
    if (Number.isInteger(this)) {
        res = res + '.';
    }
    return res;
};

/**
 * Add a method to Three.js Vector3.
 * Return a block of GLSL code recreating the same vector as a vec3
 * @return {string}
 */
Vector3.prototype.toGLSL = function () {
    return `vec3(${this.toArray()})`;
}

/**
 * Add a method to Three.js Vector4.
 * Return a block of GLSL code recreating the same vector as a vec4
 * @return {string}
 */
Vector4.prototype.toGLSL = function () {
    return `vec4(${this.toArray()})`;
}

/**
 * Add a method to Three.js Matrix4.
 * Return a block of GLSL code recreating the same vector as a mat4
 * @return {string}
 */
Matrix4.prototype.toGLSL = function () {
    return `mat4(${this.toArray()})`;
};


/**
 * @class
 *
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {


    /**
     * Constructor.
     * If no argument is passed, it should return the identity.
     * Since the constructor is different for each geometry,
     * the constructor delegate the task to the method build
     * (that can be overwritten easily unlike the constructor)
     * Another way to do would be to implement for each geometry a new class
     * that inherit from Isometry.
     * How ever the draw back is that the class Position would need also to be extended,
     * so that it manipulate the right classes.
     */
    constructor(...args) {
        this.build(...args);
    }

    /**
     * Fake constructor
     * If no argument is passed, it should return the identity.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given data.
     * @abstract
     * @param {array} data - the input data (depends on the geometry)
     * @return {Isometry}
     */
    set(data) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce the eventual numerical errors of the current isometry
     * (typically Gram-Schmidt).
     * @abstract
     * @return {Isometry}
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to the inverse of `isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    getInverse(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point
     * @return {Isometry}
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point
     * @return {Isometry}
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current isometry and `isom` are the same.
     * @abstract
     * @param isom
     * @return {boolean}
     */
    equals(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current isometry.
     * @abstract
     * @return {Isometry}
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given isometry
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    copy(isom) {
        throw new Error("This method need be overloaded.");
    }


    /**
     * Return a block of GLSL code creating the same isometry
     * Used when dynamically building shaders.
     * @abstract
     * @return {string}
     */
    toGLSL() {
        throw new Error("This method need be overloaded.");
    }


}

/**
 * @class
 *
 * @classdesc
 * Point in the geometry.
 */
class Point {

    /**
     * Constructor.
     * If no argument is passed, it should return the origin of the space.
     * Same remark as for isometries.
     */
    constructor(...args) {
        this.build(...args)
    }

    /**
     * Fake constructor.
     * If no argument is passed, it should return the origin of the space.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Update the current point with the given data.
     * @abstract
     * @param {array} data
     * @return {Point}
     */
    set(data) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Translate the current point by the given isometry.
     * @abstract
     * @param {Isometry} isom
     * @return {Point}
     */
    applyIsometry(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current point and `point ` are the same.
     * @abstract
     * @param {Point} point
     * @return {boolean}
     */
    equals(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current point.
     * @abstract
     * @return {Point}
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * set the current point with the given point
     * @abstract
     * @param {Point} point
     * @return {Point}
     */
    copy(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a line of GLSL code creating the same point
     * Used when dynamically building shaders.
     * @abstract
     * @return {string}
     */
    toGLSL() {
        throw new Error("This method need be overloaded.");
    }
}

/**
 * @class
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 *
 * @todo It seems that this class is actually geometry independent
 * (because of the choice of a reference frame).
 * If so, remove for the other files the class extensions,
 * and replace them by an `export {Vector} from './abstract.js'`
 */
class Vector extends Vector3 {

    /**
     * Rotate the current vector by the facing component of the position.
     * This method is geometry independent as the coordinates of the vector
     * are given in a chosen reference frame.
     * Only the reference frame depends on the geometry.
     * @param {Position} position
     * @return {Vector}
     */
    applyFacing(position) {
        let aux = new Vector4(this.x, this.y, this.z, 0);
        aux.applyMatrix4(position.facing);
        this.set(aux.x, aux.y, aux.z);
        return this;
    }
}

/**
 * @class
 *
 * @classdesc
 * Location and facing (of the observer, an object, etc).
 *
 * Note that the set of position is a group with the following law: (g1, m1) * (g2, m2) = (g1 * g2, m2 * m1)
 */
class Position {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     *
     * @property {Isometry} boost - the isometry component  of the position
     * @property {Matrix4} facing - the O(3) component of the position (stored as a `Matrix4`)
     */
    constructor() {
        this.boost = new Isometry();
        this.facing = new Matrix4();
    }

    /**
     * Set the boost part of the position.
     * @param {Isometry} isom
     * @return {Position}
     */
    setBoost(isom) {
        this.boost = isom;
        return this;
    }

    /**
     * Set the facing part of the position.
     * @param {Matrix4} facing
     * @return {Position}
     */
    setFacing(facing) {
        this.facing = facing;
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {Position}
     */
    reduceErrorBoost() {
        this.boost.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {Position}
     * @todo To be completed
     */
    reduceErrorFacing() {
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {Position}
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorFacing();
        return this;
    }

    /**
     * Return the underlying point
     * @return {Point}
     */
    get point() {
        return new Point().applyIsometry(this.boost);
    }

    /**
     * Translate the current position by `isom` (left action of the isometry group G on the set of positions).
     * @param {Isometry} isom
     * @return {Position}
     */
    applyIsometry(isom) {
        this.boost.premultiply(isom);
        return this;
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Matrix4} matrix
     * @return {Position}
     */
    applyFacing(matrix) {
        this.facing.multiply(matrix)
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     */
    multiply(position) {
        this.boost.multiply(position.boost);
        this.facing.premultiply(position.facing);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     */
    premultiply(position) {
        this.boost.premultiply(position.boost);
        this.facing.multiply(position.facing);
        return this;
    }

    /**
     * Set the current position with the inverse of the given position
     * @param {Position} position
     */
    getInverse(position) {
        this.boost.getInverse(position.boost);
        this.facing.getInverse(position.facing);
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`
     * @abstract
     * @param {Vector} v
     * @return {Position}
     */
    flow(v) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return the vector pointing forwards (taking into account the facing).
     * @return {Vector}
     */
    getFwdVector() {
        let aux = new Vector(0, 0, -1);
        return aux.applyFacing(this);
    }

    /**
     * Return the vector pointing to the right (taking into account the facing).
     * @return {Vector}
     */
    getRightVector() {
        let aux = new Vector(1, 0, 0);
        return aux.applyFacing(this);
    }

    /**
     * return the vector pointing upwards (taking into account the facing)
     * @return {Vector}
     */
    getUpVector() {
        let aux = new Vector(0, 1, 0);
        return aux.applyFacing(this);
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {Position} position
     * @return {boolean}
     */
    equals(position) {
        return this.boost.equals(position.boost) && this.facing.equals(position.facing);
    }

    /**
     * Return a new copy of the current position.
     * @return {Position}
     */
    clone() {
        let res = new Position()
        res.setBoost(this.boost.clone());
        res.setFacing(this.facing.clone());
        return res;
    }

    /**
     * Set the current position with the given position.
     * @param {Position} position
     * @return {Position}
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.facing.copy(position.facing);
    }
}

/**
 * @class
 *
 * @classdesc
 * Elementary brick of a discrete subgroups.
 * We describe a discrete subgroups by a set of generator.
 * Each generator is seen as a teleportation (to move a point back in the fundamental domain).
 * A Teleport encode both the generator, and the test needed to decide if a teleportation is needed.
 */
class Teleport {

    /**
     * @property {Function} test - A test saying if a teleportation is needed
     * The test is a function with the signature Point -> boolean
     * The test returns true if a teleportation is needed and false otherwise.
     */
    test;
    /** @property {Isometry} isom - the isometry to apply when teleporting */
    isom;
    /** @property {Isometry} inv - the inverse of the isometry */
    inv;
    /** @property {string} _name - a name (to be automatically setup when building the discrete subgroup) */
    id;
    /** @property {string} _name - a unique name, build from the id (private version) */
    _name;
    /** @property {Array<string>} glsl - the code to the test on the shader side (to be setup at the subgroup level) */
    glsl;


    /**
     * Constructor
     * @param {Function} test - A test saying if a teleportation is needed
     * @param {Isometry} isom - the isometry to apply when teleporting
     * @param {Isometry} inv - the inverse of the isometry (optional)
     */
    constructor(test, isom, inv = undefined) {
        this.test = test;
        this.isom = isom;
        if (inv === undefined) {
            this.inv = new Isometry().getInverse(isom);
        } else {
            this.inv = inv;
        }
        this.id = undefined;
        this._name = undefined;
        this.glsl = undefined;
    }

    get name() {
        if (this._name === undefined) {
            this._name = 'teleport' + this.id;
            // just for fun, on can add a random suffix to the name
            // in case somebody used accidentally the same name.
            this._name = this._name + '_' + Math.random().toString(16).substr(2, 8);
        }
        return this._name;
    }
}

/**
 * @class
 *
 * @classdesc
 * We describe a discrete subgroups by a set of generator.
 * Each generator is seen as a teleportation (to move a point back in the fundamental domain).
 * Thus a discrete subgroups is described by a list of teleportation.
 * The order of those teleportation, is the order in which the teleportation are performed.
 * This plays an important role if the discrete subgroups is not abelian.
 *
 * @todo Implement a more combinatorial representation of elements in the discrete subgroups.
 */
class DiscreteSubgroup {

    /** @property {Array<Teleport>} teleports - the list of teleports "generating" the subgroups */
    teleports;
    /** @property {string} shaderSource - the path to a GLSL file, implementing the teleportations tests */
    shaderSource;
    /** @property {Array<string>} glsl - the code to the test on the shader side. Each entry is a test */
    glsl;

    /**
     * Constructor
     * @param {Array<Teleport>} teleports - the list of teleports "generating" the subgroups
     * @param {string} shaderSource - the path to a GLSL file, implementing the teleportations tests
     */
    constructor(teleports, shaderSource) {
        this.teleports = teleports;
        let id = 0;
        for (const teleport of this.teleports) {
            teleport.id = id;
            id = id + 1;
        }
        this.shaderSource = shaderSource;
    }

    async glslBuildData() {
        const response = await fetch(this.shaderSource);
        const parser = new DOMParser();
        const xml = parser.parseFromString(await response.text(), 'application/xml');

        let rendered;
        const templates = xml.querySelectorAll('teleport');
        for (let i = 0; i < templates.length; i++) {
            rendered = mustache.render(templates[i].childNodes[0].nodeValue, this.teleports[i]);
            this.teleports[i].glsl = `bool test_${this.teleports[i].name}(Point p){
                ${rendered}
            }`;
        }
    }
}


/**
 * @class
 *
 * @classdesc
 * Generalized position.
 * A general position is represented as a triple (h,g,m) where
 * - h (cellBoost) is an Isometry representing an element of a discrete subgroups
 * - g (boost) is an Isometry
 * - m (facing) is a Matrix 4, seen as an isometry of the tangent space at the origin.
 * If e is the reference frame (in the tangent space at the origin) then the frame represented by the position is
 * f = d_o(hg) m e
 *
 * We split the isometry part (hg) in two pieces.
 * The idea is to g should gives a position in the fundamental domain of the (implicit) underlying lattice.
 * This will keep the coordinates of g in a bounded range.
 *
 * For simplicity we also keep track of the inverse of the cellBoost.
 *
 * @todo Allow a more combinatorial way to represent discrete subgroups, to avoid numerical error in the cellBoost
 */
class GenPosition {

    /** @property {Isometry} boost - the "discrete" component of the isometry par of the boost */
    cellBoost;
    /** @property {Isometry} boost - the inverse of cellBoost */
    invCellBoost;
    /** @property {Isometry} boost - the isometry component of the position inside the fundamental domain */
    boost;
    /** @property {DiscreteSubgroup} sbgp - the isometry component of the position inside the fundamental domain */
    sbgp;
    /** @property {Matrix4} facing - the O(3) component of the position (stored as a `Matrix4`) */
    facing;

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     *
     * @param {DiscreteSubgroup} sbgp - the underlying discrete subgroups.
     */
    constructor(sbgp) {
        this.cellBoost = new Isometry();
        this.invCellBoost = new Isometry();
        this.boost = new Isometry();
        this.facing = new Matrix4();
        this.sbgp = sbgp;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {GenPosition} the updated version of the current Position
     */
    reduceErrorBoost() {
        this.boost.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {GenPosition} the updated version of the current Position
     */
    reduceErrorCellBoost() {
        this.cellBoost.reduceError();
        this.invCellBoost.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {GenPosition} the updated version of the current Position
     * @todo To be completed
     */
    reduceErrorFacing() {
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {GenPosition} the updated version of the current Position
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorCellBoost();
        this.reduceErrorFacing();
        return this;
    }


    /**
     * Return the underlying local point (i.e. ignoring the cell boos)
     * @return {Point}
     */
    get localPoint() {
        return new Point().applyIsometry(this.boost);
    }

    /**
     * Return the underlying point
     * @return {Point}
     */
    get point() {
        return new Point().applyIsometry(this.boost).applyIsometry(this.cellBoost);
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Matrix4} matrix - An isometry of the tangent space at the origin, i.e. a matrix in O(3).
     * @return {GenPosition} the updated version of the current Position
     */
    applyFacing(matrix) {
        this.facing.multiply(matrix)
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`.
     * This version does not check if the boost stays in a fundamental domain.
     * @abstract
     * @param {Vector} v
     * @return {GenPosition} the updated version of the current Position
     */
    _flow(v) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Apply if needed a teleportation to bring back the local boos in the fundamental domain
     * @return {GenPosition}
     */
    _teleport() {
        let inside;
        let localPoint;
        while (true) {
            // compute the location of the local part of the position
            localPoint = this.localPoint;
            inside = true;
            for (const teleport of this.sbgp.teleports) {
                inside = inside && !teleport.test(localPoint);
                // if we failed the test, a teleportation is needed.
                // we perform the teleportation and exit the loop
                // (to restart the checks from the beginning).
                if (!inside) {
                    this.boost.premultiply(teleport.isom);
                    this.cellBoost.multiply(teleport.inv);
                    this.invCellBoost.premultiply(teleport.isom);
                    break;
                }
            }
            if (inside) {
                break;
            }
        }
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`
     * Additional layer to `_flow`: this method makes sure that the boost stays in the fundamental domain
     * @abstract
     * @param {Vector} v
     * @return {GenPosition} the updated version of the current Position
     */
    flow(v) {
        this._flow(v);
        this._teleport();
        return this;
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {GenPosition} position
     * @return {boolean}
     */
    equals(position) {
        let res = true;
        res = res && this.boost.equals(position.boost);
        res = res && this.cellBoost.equals(position.cellBoost);
        res = res && this.facing.equals(position.facing);
        return res;
    }

    /**
     * Return a new copy of the current position.
     * @return {GenPosition} the copy of the current position
     */
    clone() {
        let res = new GenPosition(this.sbgp);
        res.cellBoost.copy(this.cellBoost);
        res.invCellBoost.copy(this.invCellBoost);
        res.boost.copy(this.boost);
        res.facing.copy(this.facing);
        return res;
    }

    /**
     * Set the current position with the given position.
     * @param {GenPosition} position
     * @return {GenPosition} the updated version of the current Position
     */
    copy(position) {
        this.cellBoost.copy(position.cellBoost);
        this.invCellBoost.copy(position.invCellBoost);
        this.boost.copy(position.boost);
        this.facing.copy(position.facing);
    }
}

export {
    name,
    shader,
    Isometry,
    Point,
    Vector,
    Position,
    Teleport,
    DiscreteSubgroup,
    GenPosition
}
