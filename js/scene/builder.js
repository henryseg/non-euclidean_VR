/**
 * @module builder
 *
 * @description
 * Module defining the scene builder
 */

/**
 * @class SceneBuilder
 *
 * @description
 * Object use to create a scene
 *
 * @property {string} geometry - the underlying geometry
 * @property lattice - the lattice used for local scenes
 * @property {array} options - the general options of the scene
 * @property {array} items - the list of items in the scene (lights, objects, etc)
 *
 * @todo Decide the list of available options
 */
class SceneBuilder {

    /**
     * Create an instance dedicated to build a scene in the prescribed geometry
     * @param {string} geometry - the underlying geometry
     * @param {array} options - a list of options
     */
    constructor (geometry, options = null){}

    /**
     * setup the lattice used for the local scene
     * @param data - some data describing the lattice
     * @return {SceneBuilder}
     *
     * @todo Decide how the lattice should be defined
     */
    setLattice(data){}

    /**
     * set the given options
     * @param {array} options - global options for the scene
     * @return {SceneBuilder}
     */
    setOptions(options){}

    /**
     * set the given option
     * @param {string} key - key of the option
     * @param {Object} value - the value of the option
     * @return {SceneBuilder}
     */
    setOption(key, value){}

    /**
     * Adding an item to the scene.
     * This method need be declined for every kind of objects available in the geometry.
     * The precise lists of items will vary depending on the geometry.
     * @return {SceneBuilder}
     */
    addItem(){}

    /**
     * build the shader from templates files
     * @return {string} - the code of the shader
     */
    async build(){}
}

export {
    SceneBuilder
}