export function specifyRenderer(rendererClass, shader1, shader2) {
    class Renderer extends rendererClass {
        constructor() {
            super(shader1, shader2, ...arguments);
        }
    }

    return Renderer;
}