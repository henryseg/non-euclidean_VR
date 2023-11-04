export {Isometry} from "./geometries/sph/geometry/Isometry.js";
export {Point} from "./geometries/sph/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/sph/geometry/Position.js";

import shader1 from "./geometries/sph/geometry/shaders/part1.glsl";
import shader2 from "./geometries/sph/geometry/shaders/part2.glsl";

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
import {ThurstonRecordBM as ThurstonRecordBMGeneric} from "./commons/app/thurstonRecordBM/ThurstonRecordBM.js";
import {specifyThurston} from "./commons/app/specifyThurston.js";

export const Thurston = specifyThurston(ThurstonGeneric, shader1, shader2);
export const ThurstonLite = specifyThurston(ThurstonLiteGeneric, shader1, shader2);
export const ThurstonVR = specifyThurston(ThurstonVRGeneric, shader1, shader2);
export const ThurstonVRWoodBalls = specifyThurston(ThurstonVRWoodBallsGeneric, shader1, shader2);
export const ThurstonVRWoodBallsBis = specifyThurston(ThurstonVRWoodBallsBisGeneric, shader1, shader2);
export const ThurstonRecord = specifyThurston(ThurstonRecordGeneric, shader1, shader2);
export const ThurstonRecordBM = specifyThurston(ThurstonRecordBMGeneric, shader1, shader2);

export * from "./core.js";

export {default as quaternionSet} from "./geometries/sph/groups/quaternion/set.js";
export {default as poincareSet} from "./geometries/sph/groups/poincare/set.js";
export * from './geometries/sph/lights/all.js';
export * from './geometries/sph/material/all.js';
export * from './geometries/sph/shapes/all.js';
export * from './geometries/sph/solids/all.js';
