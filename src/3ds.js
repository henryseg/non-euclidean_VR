// Placeholder for the Thurston's modules.
// This file should never be included in the builds

export {Isometry} from "./core/geometry/Isometry.js";
export {Point} from "./core/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./core/geometry/Position.js";

import shader1 from "./core/geometry/shaders/model1.glsl.txt";
import shader2 from "./core/geometry/shaders/model2.glsl.txt";
import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";

