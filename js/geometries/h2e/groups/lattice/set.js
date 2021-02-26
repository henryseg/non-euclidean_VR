import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js";

const group = new Group();

function testWp(p) {
    return p.coords.w > 1;
}

// language=GLSL
const glslTestWp = `//
bool testWp(Point p){
    return p.coords.w > 1.;
}
`;

function testWn(p) {
    return p.coords.w < -1.;
}

// language=GLSL
const glslTestWn = `//
bool testWn(Point p){
    return p.coords.w < -1.;
}
`;

const shiftWp = group.element();
const shiftWn = group.element();

shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2));

const teleportWp = new Teleportation(testWp, glslTestWp, shiftWp, shiftWn);
const teleportWn = new Teleportation(testWn, glslTestWn, shiftWn, shiftWp);

const teleportations = [
    teleportWp,
    teleportWn
];

export default new TeleportationSet(teleportations);
