export {Isometry} from "./geometries/nil/geometry/Isometry.js";
export {Point} from "./geometries/nil/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/nil/geometry/Position.js";

import shader1 from "./geometries/nil/geometry/shaders/part1.glsl";
import shader2 from "./geometries/nil/geometry/shaders/part2.glsl";
import {Renderer} from "./core/renderers/Renderer.js";

Renderer.prototype.constructor.shader1 = shader1;
Renderer.prototype.constructor.shader2 = shader2;
export {Renderer};

export {BasicRenderer} from "./core/renderers/BasicRenderer.js";
export {PathTracerRenderer} from "./core/renderers/PathTracerRenderer.js";
export {VRRenderer} from "./core/renderers/VRRenderer.js";

export * from "./core.js";

export * from "./geometries/nil/groups/all.js";
export * from './geometries/nil/lights/all.js';
export * from './geometries/nil/material/all.js';
export * from './geometries/nil/shapes/all.js';
export * from './geometries/nil/solids/all.js';

export {default as importUtils} from "./geometries/nil/imports/utils.glsl";
export {default as importFakeDistance} from "./geometries/nil/imports/fakeDistance.glsl";
export {default as importExactDistance} from "./geometries/nil/imports/exactDistance.glsl";
