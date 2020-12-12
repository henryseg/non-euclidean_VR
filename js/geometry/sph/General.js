/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Three-sphere space';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader (part 1)
 * @todo The path is absolute with respect to the root of the server
 */
const shader1 = '/shaders/geometry/sph/part1.glsl';
/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader (part 2)
 * @todo The path is absolute with respect to the root of the server
 */
const shader2 = '/shaders/geometry/sph/part2.glsl';

export {name, shader1, shader2};
export {Isometry} from "./Isometry.js";
export {Point} from "./Point.js";
export {Vector} from "../abstract/Vector.js";
export {Position} from "./Position.js";
export {Teleport} from "../abstract/Teleport.js";
export {Subgroup} from "../abstract/Subgroup.js";
export {RelPosition} from "../abstract/RelPosition.js";

