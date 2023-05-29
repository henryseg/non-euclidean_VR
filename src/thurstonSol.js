export {Isometry} from "./geometries/sol/geometry/Isometry.js";
export {Point} from "./geometries/sol/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/sol/geometry/Position.js";

import shader1 from "./geometries/sol/geometry/shaders/part1.glsl";
import shader2 from "./geometries/sol/geometry/shaders/part2.glsl";

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
import {ThurstonVRWoodBalls as ThurstonVRWoodBallsGeneric} from "./commons/app/thurstonVRWoodBalls/ThurstonVRWoodBalls.js";
import {specifyThurston} from "./commons/app/specifyThurston.js";

export const Thurston = specifyThurston(ThurstonGeneric, shader1, shader2);
export const ThurstonLite = specifyThurston(ThurstonLiteGeneric, shader1, shader2);
export const ThurstonVR = specifyThurston(ThurstonVRGeneric, shader1, shader2);
export const ThurstonVRWoodBalls = specifyThurston(ThurstonVRWoodBallsGeneric, shader1, shader2);

export * from "./core.js";

export {default as mappingTorusSet} from "./geometries/sol/groups/mappingTorus/set.js";
export {default as horizontalSet} from "./geometries/sol/groups/horizontalLoops/set.js";
export {default as zLoopSet} from "./geometries/sol/groups/zLoop/set.js";
export {default as xyLoopSet} from "./geometries/sol/groups/xyLoops/set.js";
export * from './geometries/sol/lights/all.js';
export * from './geometries/sol/material/all.js';
export * from './geometries/sol/shapes/all.js';
export * from './geometries/sol/solids/all.js';
