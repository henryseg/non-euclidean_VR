export {Isometry} from "./geometries/h2e/geometry/Isometry.js";
export {Point} from "./geometries/h2e/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/h2e/geometry/Position.js";

import shader1 from "./geometries/h2e/geometry/shaders/part1.glsl";
import shader2 from "./geometries/h2e/geometry/shaders/part2.glsl";

import {BasicRenderer as BasicRendererGeneric} from "./core/renderers/BasicRenderer.js";
import {PathTracerRenderer as PathTracerRendererGeneric} from "./core/renderers/PathTracerRenderer.js";
import {VRRenderer as VRRendererGeneric} from "./core/renderers/VRRenderer.js";
import {specifyRenderer} from "./core/renderers/specifyRenderer.js";

export const BasicRenderer = specifyRenderer(BasicRendererGeneric, shader1, shader2);
export const PathTracerRenderer = specifyRenderer(PathTracerRendererGeneric, shader1, shader2);
export const VRRenderer = specifyRenderer(VRRendererGeneric, shader1, shader2);

import {Thurston as ThurstonGeneric} from "./commons/app/thurston/Thurston.js";
import {ThurstonLite as ThurstonLiteGeneric} from "./commons/app/thurstonLite/ThurstonLite.js";
import {ThurstonVR as ThurstonVRGeneric} from "./commons/app/thurstonVR/ThurstonVR.js";
import {specifyThurston} from "./commons/app/specifyThurston.js";

export const Thurston = specifyThurston(ThurstonGeneric, shader1, shader2);
export const ThurstonLite = specifyThurston(ThurstonLiteGeneric, shader1, shader2);
export const ThurstonVR = specifyThurston(ThurstonVRGeneric, shader1, shader2);

export * from "./core.js";

export {default as cuspedTorusSet} from "./geometries/h2e/groups/cuspedTorus/set.js";
export {default as orbiTorusSet} from "./geometries/h2e/groups/orbiTorus/set.js";
export {default as planeSet} from "./geometries/h2e/groups/plane/set.js";
export {default as zLoopSet} from "./geometries/h2e/groups/zLoop/set.js";
export {default as horizontalLoopSet} from "./geometries/h2e/groups/horizontalLoop/set.js";
export {default as genus2Set} from "./geometries/h2e/groups/genus2/set.js";
export {default as quotientGenus2Set} from "./geometries/h2e/groups/quotientGenus2/set.js";
export {default as horizontalQuotientGenus2Set} from "./geometries/h2e/groups/horizontalQuotientGenus2/set.js";
export * from './geometries/h2e/lights/all.js';
export * from './geometries/h2e/material/all.js';
export * from './geometries/h2e/shapes/all.js';
export * from './geometries/h2e/solids/all.js';

export {RegularHypPolygon} from "./utils/regularHypPolygon/RegularHypPolygon.js";
