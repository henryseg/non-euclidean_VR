/**
 * Take a generic Thurston class and return the class specific for a geometry
 * @param {Thurston|ThurstonLite|ThurstonVR} thurstonClass - the generic Thurston class
 * @param {string} shader1 - the first part of geometry dependent shader
 * @param {string} shader2 - the second part of geometry dependent shader
 * @return {GeomThurston} - the Thurston class build for the suitable geometry
 */
export function specifyThurston(thurstonClass, shader1, shader2) {
    class GeomThurston extends thurstonClass {
        constructor() {
            super(shader1, shader2, ...arguments);
        }
    }

    return GeomThurston;
}