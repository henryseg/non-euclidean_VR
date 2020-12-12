/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Abstract geometry';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader (part 1)
 * @todo The path is absolute with respect to the root of the server
 */
const shader1 = '/shaders/geometry/abstract/part1.glsl';
/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader (part 2)
 * @todo The path is absolute with respect to the root of the server
 */
const shader2 = '/shaders/geometry/abstract/part2.glsl';

export {name, shader1, shader2};
export {Isometry} from "./Isometry.js";
export {Point} from "./Point.js";
export {Vector} from "./Vector.js";
export {Position} from "./Position.js";
export {Teleport} from "./Teleport.js";
export {Subgroup} from "./Subgroup.js";
export {RelPosition} from "./RelPosition.js";

