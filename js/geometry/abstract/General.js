/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Abstract geometry';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'geometry/model.glsl';

export {name, shader};
export {Isometry} from "./Isometry.js";
export {Point} from "./Point.js";
export {Vector} from "./Vector.js";
export {Position} from "./Position.js";
export {Teleport} from "./Teleport.js";
export {Subgroup} from "./Subgroup.js";
export {RelPosition} from "./RelPosition.js";

