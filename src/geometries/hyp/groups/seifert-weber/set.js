import {Vector4, Vector3, Matrix4} from "three";

import {Vector} from "../../../../core/geometry/Vector.js";
import {Point} from "../../geometry/Point.js";
import {Isometry} from "../../geometry/Isometry.js";
import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";

/**
 *
 * @param {Point} point
 */
function proj2klein(point) {
    const coords = point.coords;
    return new Vector3(coords.x / coords.w, coords.y / coords.w, coords.z / coords.w);
}

// There is a lot of annoying trig that goes into getting this half width value:
// the main points are that
// - the dihedral angle alpha is 2pi/5,
// - the angle beta from the dodecahedron's center between a face and edge center is arctan(1/golden ratio).
// All computation done we get
// sinh(halfWidth) = sqrt(1 - sin^2(alpha) - sin^2(beta)) / sin(beta)

const halfWidth = 0.996384497847316;
const rotAngle = 3 * Math.PI / 5.;
const Phi = 0.5 + 0.5 * Math.sqrt(5); // golden ratio



// direction (in the tangent space at the origin) pointing to the center on a face
const dirs = [
    new Vector(0., 1, Phi),
    new Vector(0., 1, -Phi),
    new Vector(1, Phi, 0),
    new Vector(1, -Phi, 0),
    new Vector(Phi, 0, 1),
    new Vector(-Phi, 0, 1)
]

const group = new Group();
const teleportations = new TeleportationSet();

for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i].normalize();
    const halfV = dir.clone().normalize().multiplyScalar(halfWidth);
    const point = new Point().applyIsometry(new Isometry().makeTranslationFromDir(halfV));
    const klein = proj2klein(point);
    const dot = klein.dot(klein);

    const normalP = new Vector4(klein.x, klein.y, klein.z, -dot);
    const testP = function (p) {
        return p.coords.dot(normalP) > 0;
    }

    const normalN = new Vector4(klein.x, klein.y, klein.z, dot);
    const testN = function (p) {
        return p.coords.dot(normalN) < 0;
    }

    // language=GLSL
    const glslTestP = `//
    bool test${i}P(Point p){
        vec4 normal = vec4(${klein.x}, ${klein.y}, ${klein.z}, -${dot});
        return dot(p.coords, normal) > 0.;
    }
    `;

    // language=GLSL
    const glslTestN = `//
    bool test${i}N(Point p){
        vec4 normal = vec4(${klein.x}, ${klein.y}, ${klein.z}, ${dot});
        return dot(p.coords, normal) < 0.;
    }
    `;

    const negV = dir.clone().normalize().multiplyScalar(-2 * halfWidth);

    const shift = group.element();
    shift.isom.makeTranslationFromDir(negV);
    shift.isom.matrix.multiply(new Matrix4().makeRotationAxis(dir, rotAngle));

    const inv = group.element();
    inv.isom.copy(shift.isom).invert();
    // The version below does not seem to work. Ask Steve about it !
    // inv.isom.makeTranslationFromDir(fullV);
    // inv.isom.matrix.multiply(new Matrix4().makeRotationAxis(fullV.normalize(), rotAngle).transpose());

    teleportations.add(testP, glslTestP, shift, inv);
    teleportations.add(testN, glslTestN, inv, shift);
}

export default teleportations;



