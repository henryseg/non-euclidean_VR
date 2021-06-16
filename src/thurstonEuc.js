export {Isometry} from "./geometries/euc/geometry/Isometry.js";
export {Point} from "./geometries/euc/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/euc/geometry/Position.js";

import shader1 from "./geometries/euc/geometry/shaders/part1.js";
import shader2 from "./geometries/euc/geometry/shaders/part2.js";

import {BasicRendererGeneric} from "./core/renderers/BasicRendererGeneric.js";
import {PathTracerRendererGeneric} from "./core/renderers/PathTracerRendererGeneric.js";
import {VRRendererGeneric} from "./core/renderers/VRRendererGeneric.js";
import {specifyRenderer} from "./core/renderers/specifyRenderer.js";

export const BasicRenderer = specifyRenderer(BasicRendererGeneric, shader1, shader2);
export const PathTracerRenderer = specifyRenderer(PathTracerRendererGeneric, shader1, shader2);
export const VRRenderer = specifyRenderer(VRRendererGeneric, shader1, shader2);

export * from "./core.js";

export {default as freeAbelianSet} from "./geometries/euc/groups/freeAbelian/set.js";
export * from './geometries/euc/lights/all.js';
export * from './geometries/euc/material/all.js';
export * from './geometries/euc/shapes/all.js';
export * from './geometries/euc/solids/all.js';
