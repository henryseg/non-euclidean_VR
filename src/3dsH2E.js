export {Isometry} from "./geometries/h2e/geometry/Isometry.js";
export {Point} from "./geometries/h2e/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/h2e/geometry/Position.js";

import shader1 from "./geometries/h2e/geometry/shaders/part1.glsl";
import shader2 from "./geometries/h2e/geometry/shaders/part2.glsl";

import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";

export * from "./geometries/h2e/groups/all.js";
export * from './geometries/h2e/lights/all.js';
export * from './geometries/h2e/material/all.js';
export * from './geometries/h2e/shapes/all.js';
export * from './geometries/h2e/solids/all.js';

export {RegularHypPolygon} from "./utils/regularHypPolygon/RegularHypPolygon.js";
