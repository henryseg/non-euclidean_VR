export {Isometry} from "./geometries/sl2/geometry/Isometry.js";
export {Point} from "./geometries/sl2/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/sl2/geometry/Position.js";

import shader1 from "./geometries/sl2/geometry/shaders/part1.glsl";
import shader2 from "./geometries/sl2/geometry/shaders/part2.glsl";

import {BasicRenderer as BasicRendererGeneric} from "./core/renderers/BasicRenderer.js";
import {PathTracerRenderer as PathTracerRendererGeneric} from "./core/renderers/PathTracerRenderer.js";
import {VRRenderer as VRRendererGeneric} from "./core/renderers/VRRenderer.js";
import {FlatScreenRenderer as FlatScreenRendererGeneric} from "./core/renderers/FlatScreenRenderer.js";
import {specifyRenderer} from "./core/renderers/specifyRenderer.js";

export const BasicRenderer = specifyRenderer(BasicRendererGeneric, shader1, shader2);
export const PathTracerRenderer = specifyRenderer(PathTracerRendererGeneric, shader1, shader2);
export const VRRenderer = specifyRenderer(VRRendererGeneric, shader1, shader2);
export const FlatScreenRenderer = specifyRenderer(FlatScreenRendererGeneric, shader1, shader2);

import {Thurston as ThurstonGeneric} from "./commons/app/thurston/Thurston.js";
import {ThurstonLite as ThurstonLiteGeneric} from "./commons/app/thurstonLite/ThurstonLite.js";
import {ThurstonVR as ThurstonVRGeneric} from "./commons/app/thurstonVR/ThurstonVR.js";
import {ThurstonVRWoodBalls as ThurstonVRWoodBallsGeneric} from "./commons/app/thurstonVRWoodBalls/ThurstonVRWoodBalls.js";
import {ThurstonVRWoodBallsBis as ThurstonVRWoodBallsBisGeneric} from "./commons/app/thurstonVRWoodBallsBis/ThurstonVRWoodBallsBis.js";
import {ThurstonRecord as ThurstonRecordGeneric} from "./commons/app/thurstonRecord/ThurstonRecord.js";
import {specifyThurston} from "./commons/app/specifyThurston.js";

export const Thurston = specifyThurston(ThurstonGeneric, shader1, shader2);
export const ThurstonLite = specifyThurston(ThurstonLiteGeneric, shader1, shader2);
export const ThurstonVR = specifyThurston(ThurstonVRGeneric, shader1, shader2);
export const ThurstonVRWoodBalls = specifyThurston(ThurstonVRWoodBallsGeneric, shader1, shader2);
export const ThurstonVRWoodBallsBis = specifyThurston(ThurstonVRWoodBallsBisGeneric, shader1, shader2);
export const ThurstonRecord = specifyThurston(ThurstonRecordGeneric, shader1, shader2);

export * from "./core.js";

export {default as fiberLoopSet} from "./geometries/sl2/groups/fiberLoop/set.js";
export {default as genus2Set} from "./geometries/sl2/groups/genus2/set.js";
export {default as orbiTorusSet} from "./geometries/sl2/groups/orbiTorus/set.js";
export * from './geometries/sl2/lights/all.js';
export * from './geometries/sl2/material/all.js';
export * from './geometries/sl2/shapes/all.js';
export * from './geometries/sl2/solids/all.js';
