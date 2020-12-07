/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Euclidean space';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'shaders/geometry/euc.glsl';


export {name, shader};
export {Isometry} from "./Isometry.js";
export {Point} from "./Point.js";
export {Vector} from "../abstract/Vector.js";
export {Position} from "./Position.js";
export {Teleport} from "../abstract/Teleport.js";
export {Subgroup} from "../abstract/Subgroup.js";
export {RelPosition} from "../abstract/RelPosition.js";

