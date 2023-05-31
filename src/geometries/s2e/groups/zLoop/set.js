import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";
import {Vector} from "../../geometry/General.js"



const group = new Group();

function testWp(p) {
    return p.coords.w > group.halfHeight;
}

//language=GLSL
const glslTestWp = `//

bool testWp(Point p){
    return p.coords.w > group.halfHeight;
}
`;

function testWn(p) {
    return p.coords.w < -group.halfHeight;
}

//language=GLSL
const glslTestWn = `//

bool testWn(Point p){
    return p.coords.w< -group.halfHeight;
}
`;

const shiftWp = group.element();
const shiftWn = group.element();

shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2.* group.halfHeight));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2.* group.halfHeight));


const set = new TeleportationSet()
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);

set.setHalfHeight = function(value) {
    set.group.halfHeight = value;
    shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2 * group.halfHeight));
    shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2 * group.halfHeight));
}

export default set;