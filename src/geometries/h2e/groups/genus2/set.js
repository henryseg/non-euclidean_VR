import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js";
import {RegularHypPolygon} from "../../../../utils/regularHypPolygon/RegularHypPolygon";


const group = new Group();

const octagon = new RegularHypPolygon(8, Math.PI / 4);
// identification of the side of the octagon
// sides are numbered counter clock wise
const identification = [
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7]
]

const set = new TeleportationSet();

// horizontal teleportations

identification.forEach(function (item) {
    const [i, j] = item;
    const shiftIJ = group.element();
    const shiftJI = group.element();
    shiftIJ.isom.matrix.setFromMatrix3(octagon.sideIdentification(i, j));
    shiftJI.isom.matrix.setFromMatrix3(octagon.sideIdentification(j, i));

    const testIVec3 = octagon.normalTest(i);
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

    const testJVec3 = octagon.normalTest(j);
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

const [sh, _, ch] = octagon.sideCoords;
const height = Math.asinh(sh);

console.log('height', height);

function testWp(p) {
    return p.coords.w > height;
}

// language=GLSL
const glslTestWp = `//
bool testWp(Point p){
    return p.coords.w > ${height};
}
`;

function testWn(p) {
    return p.coords.w < -height;
}

// language=GLSL
const glslTestWn = `//
bool testWn(Point p){
    return p.coords.w < -${height};
}
`;


const shiftWp = group.element();
const shiftWn = group.element();
shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2 * height));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2 * height));

set.add(testWp, glslTestWp, shiftWp, shiftWn);
set.add(testWn, glslTestWn, shiftWn, shiftWp);

export default set;


