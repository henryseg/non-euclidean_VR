export {Isometry} from "./geometries/sol/geometry/Isometry.js";
export {Point} from "./geometries/sol/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/sol/geometry/Position.js";

import shader1 from "./geometries/sol/geometry/shaders/part1.glsl";
import shader2 from "./geometries/sol/geometry/shaders/part2.glsl";
import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";

export * from "./geometries/sol/groups/all.js";
export * from './geometries/sol/lights/all.js';
export * from './geometries/sol/material/all.js';
export * from './geometries/sol/shapes/all.js';
export * from './geometries/sol/solids/all.js';
