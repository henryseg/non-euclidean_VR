/**
 * @module Thurston
 *
 * @description
 * Module used to define and render a scene in one of the eight Thruston geometries.
 */

import {
 WebGLRenderer,
 Scene,
 OrthographicCamera,
 PlaneBufferGeometry,
 ShaderMaterial,
 Mesh,
 Vector2,
 Matrix4
} from "./lib/three.module.js"

import {
    mustache
} from "./lib/mustache.mjs";

import {
 gui,
 stats,
} from "./ui.js"

import {
  addListeners
} from "./events.js"

/**
* @const {WebGLRenderer}
* @default The WebGL Renderer used to produce the pictures
*/
const renderer = new WebGLRenderer();

/**
* @const {Scene}
* @default The Three.js scene (that will consists of a single square)
*/
const scene = new Scene();

/**
* @const {OrthographicCamera}
* @default The Three.js camera
*/
const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

/**
* @const {Object}
* @default The list of supported geometries, key and complete names
*/
const supportedGeom = {
  'euc': 'Euclidean space',
  'sph': '3-Sphere',
  'hyp': 'Hyperbolic space',
  'h2e': 'Product geometry: H2 x E',
  's2e': 'Product geometry: S2 x E',
  'nil': 'Nil',
  'slr': 'SL(2,R)',
  'sol': 'Sol'
};


/**
* @const {string}
* @default Path to the shader directory, relative to the current script
*/
const shaderDir = '../shaders/'

/**
* @const {array}
* @default List of the files used for the fragment shader.
* `XXX` is placeholder. It should be replaced by the key of the geometry.
* The path are relative to the shaders directory
*/
const shaderFiles = [
  'header.glsl',
  'geometry/XXX.glsl',
  'geometry/common.glsl',
  'setup.glsl',
  'sdf/XXX.glsl',
  'sdf/common.glsl',
  'scene.glsl',
  'raymarch.glsl',
  'lighting.glsl',
  'main.glsl'
];

/**
 * @class
 *
 * @classdesc
 * Object used to create a scene.
 *
 * @property {string} geometry - the underlying geometry
 * @property lattice - the lattice used for local scenes
 * @property {array} options - the general options of the scene
 * @property {array} items - the list of items in the scene (lights, objects, etc)
 * @property {Object} uniforms - the list of uniforsm passed to the shader
 * @property {Vector2} resolution - the resolution of the windows
 *
 * @todo Decide the list of available options
 */
class Thurston{

    /**
     * Create an instance dedicated to build a scene in the prescribed geometry.
     * @param {string} geom - the underlying geometry
     * @param {array} options - a list of options
     */
    constructor (geom, options = null){
      // check if the geometry is supported
      if(!(geom in supportedGeom)){
        throw new Error("This geometry is not supported yet");
      }
      this.geom = geom;
      // load the relevant library (todo)
      
      this.uniforms = undefined;
      this.resolution = undefined;

      // init all the boosts
      this.boost = new Position();
      this.leftBoost = new Position();
      this.rightBoost = new Position();
      this.cellBoost = new Position();
      this.invCellBoost = new Position();
    }


    /**
     * Setup the lattice used for the local scene.
     * @param data - some data describing the lattice
     * @return {Thurston}
     *
     * @todo Decide how the lattice should be defined
     */
    setLattice(data){
      return this;
    }

    /**
     * Set the given options.
     * @param {array} options - global options for the scene
     * @return {Thurston}
     */
    setOptions(options){
      return this;
    }

    /**
     * Set the given option.
     * @param {string} key - key of the option
     * @param {Object} value - the value of the option
     * @return {Thurston}
     */
    setOption(key, value){
      return this;
    }

    /**
     * Adding an item to the scene.
     * This method need be declined for every kind of objects available in the geometry.
     * The precise lists of items will vary depending on the geometry.
     * @return {Thurston}
     */
    addItem(){}

    /**
     * add the name of the geometry to the title of the page
     * @return {Thurston}
     */
    appendTitle(){
      const title = document.querySelector('title');
      title.append(' - ' + supportedGeom[this.geom]);
      return this;
    }

    /**
     * Build the vertex shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildVertexShader(){
      const response = await fetch("../shaders/vertex.glsl");
      const vShader = await response.text();
      return vShader;
    }

    /**
     * Build the frament shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildFragmentShader(){
      // process the shader files.
      let file;
      let response;
      let fShader = "";
      for(const shaderFile of shaderFiles){
        // update if needed the placeholder with the relevant geometry
        file = shaderFile.replace('XXX', this.geom);
        // load the file and append it to the shader
        response = await fetch(shaderDir + file);
        fShader = fShader + await response.text();
      }
      return fShader;
    }

    /**
     * Setup the uniforms which are passed to the shader
     */
    setupUniforms(){
      this.uniforms = {
        maxMarchingSteps: {
          type: "int",
          value: 100
        },
        minDist: {
          type: "float",
          value: 0.
        },
        maxDist: {
          type: "float",
          value: 30.
        },
        marchingThreshold: {
          type: "float",
          value: 0.001
        },
        fov: {
          type: "float",
          value: 90.
        },
        stereo: {
          type: "bool",
          value: false
        },
        resolution: {
          type: "vec2",
          value: this.resolution
        },
        boostsRawA: {
          type: "mat4",
          value: new Matrix4()
        },
        boostsRawB: {
          type: "float",
          value: 0.
        },
        facings: {
          type: "mat4",
          value: new Matrix4()
        },
      }
    }

    /**
     * Update the uniforms which are passed to the shader
     */
     updateUniforms(){}


    /**
     * Init
     * Setup the genral WebGL machinery via Three.js
     * Create a simple scene with a screen and an orthographic camera
     * Setup the shaders
     */
    async init() {
      // setup WebGL machinery through Three.js
      renderer.setPixelRatio(window.devicePixelRatio);
		  renderer.setSize(window.innerWidth, window.innerHeight);
      this.resolution = new Vector2(window.innerWidth, window.innerHeight);
		  document.body.appendChild(renderer.domElement);

      // building a simple scene with a single screen
      const geometry = new PlaneBufferGeometry(2, 2);
      this.setupUniforms();
      let material = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader : await this.buildVertexShader(),
        fragmentShader: await this.buildFragmentShader(),
        transparent: true
      });
      const mesh = new Mesh(geometry, material);
    	scene.add(mesh);

      this.appendTitle();
      addListeners();
    }

    /**
     * Animates the simulation
     */
    animate(){
      let self = this;
      window.requestAnimationFrame(function() {
          self.animate();
      });
      stats.begin();
    	renderer.render(scene, camera);
      stats.end();
    }
}


/**
 * @class
 *
 * @classdesc
 * Material for objects in the scene
 *
 * @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
 *
 * @property {Vector4} color - color of the object
 * @property {number} specular - specular reflection constant
 * @property {number} diffuse - diffuse reflection constant
 * @property {number} ambient - ambient reflection constant
 * @property {number} shininess - shininess constant
 *
 * @todo Decide what to do for texture, color given by formulas, etc
 */

class SceneMaterial {

    /**
     * Constructor. Build a new material from the given data
     * @param {array} data - the properties of the material
     */
    constructor(data) {
    }
}

/**
 * @class
 *
 * @classdesc
 * Generic class for items in the scene (objects, lights, etc)
 * This class should never be instantiated directly.
 * Classes that inherit from SceneItem can be instantiated
 * All the properties are not mandatory.
 * Their use will depend on the type of objects.
 * The philosophy is to collect in this class all properties that can be used in more that one inherited class,
 * so that the code is factored as much as possible
 *
 * @property {number} id - a unique ID
 * @property {boolean} global  - flag: true if the item is in the global scene, false otherwise
 * @property {boolean} light - flag: true if the item is a light, false otherwise
 * @property {boolean} render - flag: true if the item should be rendered, false otherwise (useful for lights)
 * @property {SceneMaterial}  material - material of the item
 * @property {Vector3} lightColor - color of the light (if the item is a light)
 * @property {Position} position - location and facing of the object. The facing only matters for textures?
 * @property {function} positionCallback - a function that update the position (for animated objects)
 *
 */
class SceneItem {

    /**
     * Constructor.
     * @param {array} data
     * @todo Decide what arguments the generic constructor should receive
     */
    constructor(data) {
    }
}

export {
    Thurston,
    renderer,
    SceneMaterial
}
