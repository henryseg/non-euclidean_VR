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
  Vector3,
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
* @const {string}
* @default Path to the shader directory, relative to the current script
*/
const shaderDir = '../shaders/';

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
  'items.glsl',
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
  * @param {string} geomKey - the underlying geometry
  * @param {array} options - a list of options
  * @todo Check if the geometry is supported, i.e. if the relevant files exist.
  */
  constructor (geomKey, options = null) {
    // define all the properties (maybe not needed in JS, but good practice I guess)
    this.geomKey = geomKey;

    this.geomMod = undefined;
    this.uniforms = undefined;
    this.resolution = undefined;
    this.position = undefined;
    this.leftPosition = undefined;
    this.rightPosition = undefined;
    this.cellBoost = undefined;
    this.invCellBoost = undefined;
  }

  async initGeom() {
    // load the relevant library
    this.geomMod = await import('./geometry/' + this.geomKey + '.js');

    // init all the boosts
    this.position = new this.geomMod.Position();
    this.leftPosition = new this.geomMod.Position();
    this.rightPosition = new this.geomMod.Position();
    this.cellBoost = new this.geomMod.Isometry();
    this.invCellBoost = new this.geomMod.Isometry();

    // loading the item library for the relevant geometry
    await import('./items/' + this.geomKey + '.js');

    return this;
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
    title.append(' - ' + this.geomMod.name);
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
      file = shaderFile.replace('XXX', this.geomMod.key);
      // load the file and append it to the shader
      response = await fetch(shaderDir + file);
      fShader = fShader + await response.text();
    }
    return fShader;
  }

  /**
  * Serialize all the positions and boost in a form that can be passed to the shader
  * @return {array} the output in an array with three entries:
  * - a list of 5 Matrix4 (the part A of the isometries position, left/right position, cell and invCell).
  * - a list of 5 floating numbers (the part B of the isometries position, left/right position, cell and invCell).
  * - a list of 3 Matrix4 (the facing, left and right facings).
  */
  serializeData(){
    const rawA = [];
    const rawB = [];
    const facings = [];
    let i = 0;
    let raw;
    const data = [
      this.position,
      this.leftPosition,
      this.rightPosition,
      this.cellBoost,
      this.invCellBoost
    ]
    for(const pos of data){
      raw = pos.serialize();
      rawA[i] = raw[0];
      rawB[i] = raw[1];
      if(i < 3){
        facings[i] = raw[2];
      }
      i = i+1;
    }
    return [rawA, rawB, facings];
  }

  /**
  * Setup the uniforms which are passed to the shader
  */
  setupUniforms(){
    const rawData = this.serializeData();
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
        value: rawData[0]
      },
      boostsRawB: {
        type: "float",
        value: rawData[1]
      },
      facings: {
        type: "mat4",
        value: rawData[2]
      },
    }
  }

  /**
  * Update the uniforms which are passed to the shader
  */
  updateUniforms(){
    const rawData = this.serializeData();
    this.uniforms.boostsRawA.value = rawData[0];
    this.uniforms.boostsRawB.value = rawData[1];
    this.uniforms.facings.value = rawData[2];
  }


  /**
  * Init
  * Setup the genral WebGL machinery via Three.js
  * Create a simple scene with a screen and an orthographic camera
  * Setup the shaders
  */
  async init() {
    // setup the geoemetry
    await this.initGeom();

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
    this.updateUniforms();
    renderer.render(scene, camera);
    stats.end();
  }
}



export {
  Thurston,
  renderer,
}
