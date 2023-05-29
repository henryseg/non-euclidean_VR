export {Isometry} from "./geometries/hyp/geometry/Isometry.js";
export {Point} from "./geometries/hyp/geometry/Point.js";
export {Vector} from "./core/geometry/Vector.js";
export {Position} from "./geometries/hyp/geometry/Position.js";

import shader1 from "./geometries/hyp/geometry/shaders/part1.glsl";
import shader2 from "./geometries/hyp/geometry/shaders/part2.glsl";

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
export {NativeCamera} from "./geometries/hyp/cameras/native/NativeCamera.js";

export {default as cubeSet} from "./geometries/hyp/groups/cube/set.js";
export {default as symCubeSet} from "./geometries/hyp/groups/cube/symbSet.js";
export {default as SWSet} from "./geometries/hyp/groups/seifert-weber/set.js";
export {default as whiteheadSet} from "./geometries/hyp/groups/whitehead/set.js";
export {default as m125Set} from "./geometries/hyp/groups/m125/set.js";
export * from './geometries/hyp/lights/all.js';
export * from './geometries/hyp/material/all.js';
export * from './geometries/hyp/shapes/all.js';
export * from './geometries/hyp/solids/all.js';

