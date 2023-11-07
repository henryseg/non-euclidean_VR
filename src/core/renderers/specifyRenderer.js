/**
 * Take a generic renderer class and return the class specific for a geometry
 * @param {AbstractRenderer} rendererClass - the generic renderer
 * @param {string} shader1 - the first part of geometry dependent shader
 * @param {string} shader2 - the second part of geometry dependent shader
 * @return {GeomRenderer} - the renderer build for the suitable geometry
 */
export function specifyRenderer(rendererClass, shader1, shader2) {
    class GeomRenderer extends rendererClass {
        constructor() {
            super(shader1, shader2, ...arguments);
        }
    }
    return GeomRenderer;
}