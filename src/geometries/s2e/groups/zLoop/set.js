import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js"



const group = new Group();

function testWp(p) {
    return p.coords.w > 0.75;
}

//language=GLSL
const glslTestWp = `//

bool testWp(Point p){
    return p.coords.w>0.75;
}
`;

function testWn(p) {
    return p.coords.w < -0.75;
}

//language=GLSL
const glslTestWn = `//

bool testWn(Point p){
    return p.coords.w<-0.75;
}
`;

const shiftWp = group.element();
const shiftWn = group.element();

shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -1.5));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 1.5));

export default new TeleportationSet()
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);
