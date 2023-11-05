import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group} from "./Group.js";
import {Vector} from "../../geometry/General.js";
import {RegularHypPolygon} from "../../../../utils/regularHypPolygon/RegularHypPolygon";


const group = new Group();

const square = new RegularHypPolygon(4, Math.PI / 3);
// identification of the side of the octagon
// sides are numbered counter clock wise
const identification = [
    [0, 2],
    [1, 3]
]

const set = new TeleportationSet();

// horizontal teleportations

identification.forEach(function (item) {
    const [i, j] = item;
    const shiftIJ = group.element();
    const shiftJI = group.element();
    if (i === 0) {
        shiftIJ.finitePart.set(0, -1);
        shiftJI.finitePart.set(0, -1);
    }
    if (i === 1) {
        shiftIJ.finitePart.set(1, -1);
        shiftJI.finitePart.set(1, -1);
    }
    shiftIJ.isom.matrix.setFromMatrix3(square.sideIdentification(i, j));
    shiftJI.isom.matrix.setFromMatrix3(square.sideIdentification(j, i));

    const testIVec3 = square.normalTest(i);
    const testIVec4 = new Vector4(testIVec3.x, testIVec3.y, testIVec3.z, 0);

    const testI = function (p) {
        return p.coords.dot(testIVec4) > 0;
    }

    // language=GLSL
    const glslTestI = `//
    bool test${i}(Point p){
        vec4 normal = vec4(${testIVec4.x}, ${testIVec4.y}, ${testIVec4.z}, ${testIVec4.w});
        return dot(p.coords, normal) > 0.;
    }
    `;

    set.add(testI, glslTestI, shiftIJ, shiftJI);

    const testJVec3 = square.normalTest(j);
    const testJVec4 = new Vector4(testJVec3.x, testJVec3.y, testJVec3.z, 0);

    const testJ = function (p) {
        return p.coords.dot(testJVec4) > 0;
    }

    // language=GLSL
    const glslTestJ = `//
    bool test${j}(Point p){
        vec4 normal = vec4(${testJVec4.x}, ${testJVec4.y}, ${testJVec4.z}, ${testJVec4.w});
        return dot(p.coords, normal) > 0.;
    }
    `;

    set.add(testJ, glslTestJ, shiftJI, shiftIJ);
});

// vertical teleportations

function testWp(p) {
    return p.coords.w > group.halfHeight;
}

// language=GLSL
const glslTestWp = `//
bool testWp(Point p){
    return p.coords.w > group.halfHeight;
}
`;

function testWn(p) {
    return p.coords.w < -group.halfHeight;
}

// language=GLSL
const glslTestWn = `//
bool testWn(Point p){
    return p.coords.w < -group.halfHeight;
}
`;


const shiftWp = group.element();
const shiftWn = group.element();
shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2 * group.halfHeight));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2 * group.halfHeight));

set.add(testWp, glslTestWp, shiftWp, shiftWn);
set.add(testWn, glslTestWn, shiftWn, shiftWp);

set.setHalfHeight = function(value) {
    set.group.halfHeight = value;
    shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2 * group.halfHeight));
    shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2 * group.halfHeight));
}

export default set;


