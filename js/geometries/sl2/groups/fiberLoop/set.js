import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js";

const group = new Group();

const height = 2 * Math.PI;

function testWp(p) {
    return p.fiber > 0.5 * height;
}

// language=GLSL
const glslTestWp = `//
bool testWp(Point p){
    return p.fiber > ${0.5 * height};
}
`;

function testWn(p) {
    return p.fiber < -0.5 * height;
}

// language=GLSL
const glslTestWn = `//
bool testWn(Point p){
    return p.fiber < -${0.5 * height};
}
`;

const shiftWp = group.element();
const shiftWn = group.element();

shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -height));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, height));

const teleportWp = new Teleportation(testWp, glslTestWp, shiftWp, shiftWn);
const teleportWn = new Teleportation(testWn, glslTestWn, shiftWn, shiftWp);

const teleportations = [
    teleportWp,
    teleportWn
];

export default new TeleportationSet(teleportations);