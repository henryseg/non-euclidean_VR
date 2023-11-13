export {Isometry} from "./geometries/euc/geometry/Isometry.js";
export {Point} from "./geometries/euc/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/euc/geometry/Position.js";

import shader1 from "./geometries/euc/geometry/shaders/part1.glsl";
import shader2 from "./geometries/euc/geometry/shaders/part2.glsl";
import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";
// export {DollyCamera} from "./geometries/euc/cameras/dolly/DollyCamera.js";

export * from "./geometries/euc/groups/all.js";
export * from './geometries/euc/lights/all.js';
export * from './geometries/euc/material/all.js';
export * from './geometries/euc/shapes/all.js';
export * from './geometries/euc/solids/all.js';
