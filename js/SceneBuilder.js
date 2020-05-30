import {
    mustache
} from './module/mustache.mjs';

import {
    Vector3,
    Vector4,
    FileLoader
} from './module/three.module.js';


const SHADER_DIR = '../shaders/';


/**
 * Method that create a line of code creating a new vec3 in the shader with the corresponding coordinates
 * @returns {string} the appropriate code
 */
Vector3.prototype.toGLSL = function () {
    let res = 'vec3(';
    res = res + this.x + ',' + this.y + ',' + this.z;
    res = res + ')';
    return res;
}

/**
 * Method that create a line of code creating a new vec3 in the shader with the corresponding coordinates
 * @returns {string} the appropriate code
 */
Vector4.prototype.toGLSL = function () {
    let res = 'vec4(';
    res = res + this.x + ',' + this.y + ',' + this.z + ',' + this.w;
    res = res + ')';
    return res;
}


/**
 * Abstract class for items in the scene
 *
 * @class
 * @private
 */
class SceneItem {

    /**
     * Constructor
     * @param {Number} id - identification of the object
     * @param {Vector4} color - the color of the object
     * @param {boolean} global - says if the object is global
     */
    constructor(id, color, global) {
        this.id = id;
        this.color = color;
        this.global = global;
    }

    /**
     * Return the code creating the color as an OpenGL vector
     * @returns {string}
     */
    colorGLSL() {
        return this.color.toGLSL();
    }

    isGlobal() {
        return this.global;
    }

    isLocal() {
        return !this.global;
    }

    isLight() {
        throw "The isLight method has not been implemented for this class";
    }

    isObject() {
        throw "The isObject method has not been implemented for this class";
    }

    isGlobalLight() {
        return this.isGlobal() && this.isLight();
    }

    isLocalLight() {
        return this.isLocal() && this.isLight();
    }

    isGlobalObject() {
        return this.isGlobal() && this.isObject();
    }

    isLocalObject() {
        return this.isLocal() && this.isObject();
    }
}


/**
 * Class of lights
 * @class
 * @public
 */
class SceneLight extends SceneItem {

    /**
     * Constructor
     * @param {Number} id - identification of the object
     * @param {Vector4} position - position of the light
     * @param {Vector4} color - color of the light (the fourth entries is the intensity)
     * @param {float} size - size of the light
     * @param {boolean} global - say is the light is global or not
     */
    constructor(id, position, color, size, global) {
        super(id, color, global);
        this.position = position;
        this.size = size;
    }

    /**
     * Return the code creating the position as an OpenGL vector
     * @returns {string}
     */
    positionGLSL() {
        return this.position.toGLSL();
    }

    isLight() {
        return true;
    }

    isObject() {
        return false;
    }
}

/**
 * Abstract class for objects in the scene
 * @class
 * @public
 */
class SceneObject extends SceneItem {

    isLight() {
        return false;
    }

    isObject() {
        return true;
    }
}

/**
 * Class for spheres
 * @class
 * @public
 */
class Sphere extends SceneObject {

    /**
     * Constructor
     * @param {Number} id - identification of the object
     * @param {Vector4} center - the center of the sphere
     * @param {float } radius - radius
     * @param {Vector4} color - the color of the sphere
     * @param {boolean} global - says if the object is global
     */
    constructor(id, center, radius, color, global) {
        super(id, color, global);
        this.center = center;
        this.radius = radius;
    }

    centerGLSL() {
        return this.center.toGLSL();
    }

    isSphere() {
        return true;
    }
}

/**
 * Class for ellipsoids
 * @class
 * @public
 */
class Ellipsoid extends SceneObject {

    /**
     * Constructor
     * @param {Number} id - identification of the object
     * @param {Vector4} center - the center of the sphere
     * @param {Vector3} axes - the length of the three axes
     * @param {float } radius - radius
     * @param {Vector4} color - the color of the object
     * @param {boolean} global - says if the object is global
     */
    constructor(id, center, axes, radius, color, global) {
        super(id, color, global);
        this.center = center;
        this.axes = axes;
        this.radius = radius;
    }

    centerGLSL() {
        return this.center.toGLSL();
    }

    axesGLSL() {
        return this.axes.toGLSL();
    }

    isEllipsoid() {
        return true;
    }
}

/**
 * Class for the compleement of a sphere
 * @class
 * @public
 */
class SphereComplement extends SceneObject {

    /**
     * Constructor
     * @param {Number} id - identification of the object
     * @param {Vector4} center - the center of the sphere
     * @param {float } radius - radius
     * @param {Vector4} color - the color of the sphere
     * @param {boolean} global - says if the object is global
     */
    constructor(id, center, radius, color, global) {
        super(id, color, global);
        this.center = center;
        this.radius = radius;
    }

    centerGLSL() {
        return this.center.toGLSL();
    }

    isSphereComplement() {
        return true;
    }
}


/**
 * Class to create a new scene in the given geometry
 * @class
 * @public
 */
class SceneBuilder {

    /**
     * Constructor
     * @param {Vector4} bgColor - the color of the background
     */
    constructor(bgColor) {
        /** @property {Vector4} */
        this.bgColor = bgColor;
        /** @property {Array.<SceneItem>} */
        this.items = [];
        /** @property {Number} */
        this.lastId = 0;
    }

    /**
     * Add a light to the scene
     * @param position
     * @param size
     * @param color
     * @param isGlobal
     */
    addLight(position, color, size, isGlobal) {
        this.lastId++;
        let item = new SceneLight(this.lastId, position, color, size, isGlobal);
        this.items.push(item);
    }

    addSphere(center, radius, color, isGlobal) {
        this.lastId++;
        let item = new Sphere(this.lastId, center, radius, color, isGlobal);
        this.items.push(item);
    }

    addEllipsoid(center, axes, radius, color, isGlobal) {
        this.lastId++;
        let item = new Ellipsoid(this.lastId, center, axes, radius, color, isGlobal);
        this.items.push(item);
    }

    addSphereComplement(center, radius, color, isGlobal) {
        this.lastId++;
        let item = new SphereComplement(this.lastId, center, radius, color, isGlobal);
        this.items.push(item);
    }

    /**
     * Build the scene
     */
    async build() {
        let files = [
            '01structs.glsl',
            '02setup.glsl',
            '03localGeo.glsl',
            '04globalGeo.glsl',
            '05basicSDFs.glsl',
            '06compoundSDFs.glsl'
        ]
        let shader = '';
        let response;
        let template;
        let code;

        for (const file of files) {
            response = await fetch(SHADER_DIR + file, {cache: "no-store"});
            code = await response.text();
            shader = shader + code;
        }

        response = await fetch(SHADER_DIR + '07scene.mustache', {cache: "no-store"});
        template = await response.text();
        code = mustache.render(template, {
            "items": this.items
        });
        shader = shader + code;

        response = await fetch(SHADER_DIR + '08raymarch.glsl', {cache: "no-store"});
        code = await response.text();
        shader = shader + code;

        response = await fetch(SHADER_DIR + '09lighting.mustache', {cache: "no-store"});
        template = await response.text();
        code = mustache.render(template, {
            "phong": this.items
        });
        shader = shader + code;

        response = await fetch(SHADER_DIR + '10materials.mustache', {cache: "no-store"});
        template = await response.text();
        code = mustache.render(template, {
            "bgColor": this.bgColor.toGLSL(),
            "pixels": this.items
        });
        shader = shader + code;

        response = await fetch(SHADER_DIR + '11main.glsl', {cache: "no-store"});
        code = await response.text();
        shader = shader + code;

        console.log(shader);
        return shader;

    }
}


export {
    SceneBuilder
}