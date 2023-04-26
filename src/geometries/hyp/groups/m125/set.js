import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";


/*
Isometry group corresponding to the manifold m125 (from Snapy census?)
The fundamental domain is an octahedron.
 */

const group = new Group();

// "normals" to the faces
const normal0 = new Vector4(-1, -1, -1, -1);
const normal1 = new Vector4(1, 1, -1, -1);
const normal2 = new Vector4(1, -1, -1, -1);
const normal3 = new Vector4(-1, 1, -1, -1);
const normal4 = new Vector4(-1, -1, 1, -1);
const normal5 = new Vector4(1, 1, 1, -1);
const normal6 = new Vector4(1, -1, 1, -1);
const normal7 = new Vector4(-1, 1, 1, -1);

const normals = [normal0, normal1, normal2, normal3, normal4, normal5, normal6, normal7];


// building a list of pairs of test.
// one pair for each face
// the elements of the pairs are the JS and the GLSL tests respectively
const testPairs = [];

for (let i = 0; i < 8; i++) {
    testPairs.push([
        function (p) {
            return p.coords.dot(normals[i]) > 0;
        },
        // language=GLSL
        `bool test${i}(Point p){
            vec4 normal = vec4(${normals[i].x}, ${normals[i].y}, ${normals[i].z}, ${normals[i].w});
            return dot(p.coords, normal) > 0.;
        }`
    ])
}

const shift01 = group.element();
const shift23 = group.element();
const shift45 = group.element();
const shift67 = group.element();

shift01.isom.matrix.set(
    1, 0, 1, 1,
    0, 1, 1, 1,
    -1, -1, 0, -1,
    1, 1, 1, 2
);

shift23.isom.matrix.set(
    1, 0, -1, -1,
    0, 1, 1, 1,
    1, -1, 0, -1,
    -1, 1, 1, 2
);

shift45.isom.matrix.set(
    0, 1, -1, 1,
    1, 1, 0, 1,
    1, 0, -1, 1,
    1, 1, -1, 2
);

shift67.isom.matrix.set(
    1, -1, 0, -1,
    -1, 0, -1, 1,
    0, 1, -1, 1,
    -1, 1, -1, 2
);

const shift10 = group.element();
const shift32 = group.element();
const shift54 = group.element();
const shift76 = group.element();

shift10.isom.copy(shift01.isom).invert();
shift32.isom.copy(shift23.isom).invert();
shift54.isom.copy(shift45.isom).invert();
shift76.isom.copy(shift67.isom).invert();

export default new TeleportationSet()
    .add(testPairs[0][0], testPairs[0][1], shift01, shift10)
    .add(testPairs[1][0], testPairs[1][1], shift10, shift01)
    .add(testPairs[2][0], testPairs[2][1], shift23, shift32)
    .add(testPairs[3][0], testPairs[3][1], shift32, shift23)
    .add(testPairs[4][0], testPairs[4][1], shift45, shift54)
    .add(testPairs[5][0], testPairs[5][1], shift54, shift45)
    .add(testPairs[6][0], testPairs[6][1], shift67, shift76)
    .add(testPairs[7][0], testPairs[7][1], shift76, shift67);





