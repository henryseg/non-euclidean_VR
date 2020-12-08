import {
    Vector3,
    Vector4,
    Matrix3,
    Matrix4,
    Quaternion
} from "./lib/three.module.js"


/**
 * Add a method to Three.js Quaternion.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
Quaternion.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`
}


/**
 * Add a method to Three.js Vector3.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
Vector3.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}]`
}

/**
 * Add a method to Three.js Vector4.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
Vector4.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`
}


/**
 * Add a method to Three.js Matrix3.
 * Return a human-readable version of the matrix (for debugging purpose)
 * @return {string}
 */
Matrix3.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 3 * j];
        }
        res = res + "\r\n";
    }
    return res;
}

/**
 * Add a method to Three.js Matrix4.
 * Return a human-readable version of the matrix (for debugging purpose)
 * @return {string}
 */
Matrix4.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 4 * j];
        }
        res = res + "\r\n";
    }
    return res;
}


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
 * Transform a method attached to an object into a function.
 * @param {Object} scope - the object on which the method is called
 * @param {function} fn - the method to call
 * @return {function(): *}
 */
function bind(scope, fn) {
    return function () {
        return fn.apply(scope, arguments);
    };
}


export {
    bind
}