/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Hyperbolic space';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is absolute with respect to the root of the server
 */
const shader = '/shaders/geometry/hyp.glsl';


export {name, shader};
export {Isometry} from "./Isometry.js";
export {Point} from "./Point.js";
export {Vector} from "../abstract/Vector.js";
export {Position} from "./Position.js";
export {Teleport} from "../abstract/Teleport.js";
export {Subgroup} from "../abstract/Subgroup.js";
export {RelPosition} from "../abstract/RelPosition.js";

