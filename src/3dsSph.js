export {Isometry} from "./geometries/sph/geometry/Isometry.js";
export {Point} from "./geometries/sph/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/sph/geometry/Position.js";

import shader1 from "./geometries/sph/geometry/shaders/part1.glsl";
import shader2 from "./geometries/sph/geometry/shaders/part2.glsl";
import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";

export * from "./geometries/sph/groups/all.js";
export * from './geometries/sph/lights/all.js';
export * from './geometries/sph/material/all.js';
export * from './geometries/sph/shapes/all.js';
export * from './geometries/sph/solids/all.js';
