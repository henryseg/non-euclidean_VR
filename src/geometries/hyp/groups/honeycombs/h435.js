import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {RegularHypPolygon} from "../../../../utils/regularHypPolygon/RegularHypPolygon.js";


/*
 Auxilary computations
 */

const polygon = new RegularHypPolygon(4, 2 * Math.PI / 5);
const [shL, _, chL] = polygon.sideCoords;
const sh2L = 2 * shL * chL;
const ch2L = chL * chL + shL * shL;

/*
Isometry group corresponding to the manifold m125 (from Snapy census?)
The fundamental domain is an octahedron.
 */

const group = new Group();

// "normals" to the faces
// normal at the origin to the "plane" {z = 0}
const normal0 = new Vector4(0, 0, 1, 0);
// normal at the origin to the "plane" {y = -z}
const normal1 = new Vector4(0, -1, -1, 0).normalize();
// normal at the origin to the "plane" {y = x}
const normal2 = new Vector4(-1, 1, 0, 0).normalize();
// normal at the point [shL, O, O, chl]
const normal3 = new Vector4(chL, 0, 0, -shL);

const normals = [normal0, normal1, normal2, normal3];

// reflection at the origin across the "plane" {z = 0}
const elt0 = group.element();
elt0.isom.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1
);
// reflection at the origin across the "plane" {y = -z}
const elt1 = group.element();
elt1.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1
);
// reflection at the origin across the "plane" {y = x}
const elt2 = group.element();
elt2.isom.matrix.set(
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
);
// reflection at the point [shL, O, O, chl]
const elt3 = group.element();
elt3.isom.matrix.set(
    -ch2L, 0, 0, sh2L,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -sh2L, 0, 0, ch2L
);

const isoms = [elt0, elt1, elt2, elt3];

const set = new TeleportationSet();


// building a list of pairs of test.
// one pair for each face
// the elements of the pairs are the JS and the GLSL tests respectively
const testPairs = [];

for (let i = 0; i < 4; i++) {
    const test = function (p) {
        return p.coords.dot(normals[i]) > 0;
    };
    // language=GLSL
    const glslTest = `//
    bool test${i}(Point p){
        vec4 normal = vec4(${normals[i].x}, ${normals[i].y}, ${normals[i].z}, ${normals[i].w});
        return dot(p.coords, normal) > 0.;
    }`;
    set.add(test, glslTest, isoms[i], isoms[i]);
}


export default set;



