export {Isometry} from "./geometries/hyp/geometry/Isometry.js";
export {Point} from "./geometries/hyp/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/hyp/geometry/Position.js";

import shader1 from "./geometries/hyp/geometry/shaders/part1.glsl";
import shader2 from "./geometries/hyp/geometry/shaders/part2.glsl";

import {Renderer} from "./core/renderers/Renderer.js";
Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";
export {NativeCamera} from "./geometries/hyp/cameras/native/NativeCamera.js";

export * from "./geometries/hyp/groups/all.js";
export * from './geometries/hyp/lights/all.js';
export * from './geometries/hyp/material/all.js';
export * from './geometries/hyp/shapes/all.js';
export * from './geometries/hyp/solids/all.js';

export {RegularHypPolygon} from "./utils/regularHypPolygon/RegularHypPolygon.js";

