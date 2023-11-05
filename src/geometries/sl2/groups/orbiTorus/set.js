import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Point, Vector} from "../../geometry/General.js";
import {Vector4} from "three";

const group = new Group();

const sqrt2 = Math.sqrt(2);
const sqrt3 = Math.sqrt(3);
const height = 2 * Math.PI;
const threshold = sqrt2 / sqrt3;
const n1 = new Vector4(1, 1, 0, 0);
const n2 = new Vector4(-1, 1, 0, 0);

function testSide1P(p) {
    const klein = p.toKlein();
    return klein.dot(n1) > threshold;
}

// language=GLSL
const glslTestSide1P = `//
                        bool testSide1P(Point p) {
                            vec4 n1 = vec4(1, 1, 0, 0);
                            vec4 klein = toKlein(p);
                            return dot(klein, n1) > ${threshold};
                        }
`;

function testSide1N(p) {
    const klein = p.toKlein();
    return klein.dot(n1) < -threshold;
}

// language=GLSL
const glslTestSide1N = `//
                        bool testSide1N(Point p) {
                            vec4 n1 = vec4(1, 1, 0, 0);
                            vec4 klein = toKlein(p);
                            return dot(klein, n1) < -${threshold};
                        }
`;

function testSide2P(p) {
    const klein = p.toKlein();
    return klein.dot(n2) > threshold;
}

// language=GLSL
const glslTestSide2P = `//
                        bool testSide2P(Point p) {
                            vec4 n2 = vec4(-1, 1, 0, 0);
                            vec4 klein = toKlein(p);
                            return dot(klein, n2) > ${threshold};
                        }
`;

function testSide2N(p) {
    const klein = p.toKlein();
    return klein.dot(n2) < -threshold;
}

// language=GLSL
const glslTestSide2N = `//
                        bool testSide2N(Point p) {
                            vec4 n2 = vec4(-1, 1, 0, 0);
                            vec4 klein = toKlein(p);
                            return dot(klein, n2) < -${threshold};
                        }
`;


function testWp(p) {
    return p.fiber > 0.5 * height;
}

// language=GLSL
const glslTestWp = `//
                    bool testWp(Point p) {
                        return p.fiber > ${0.5 * height};
                    }
`;

function testWn(p) {
    return p.fiber < -0.5 * height;
}

// language=GLSL
const glslTestWn = `//
                    bool testWn(Point p) {
                        return p.fiber < -${0.5 * height};
                    }
`;
const shiftA = group.element();
const sinftAInv = group.element();
const shiftB = group.element();
const shiftBInv = group.element();
const shiftWp = group.element();
const shiftWn = group.element();

const auxA = new Point();
const auxB = new Point();
auxA.proj.set(0.5 * sqrt3, 0.5 * sqrt3, 0.5 * sqrt2, 0);
auxA.fiber = 0.5 * Math.PI;
auxB.proj.set(0.5 * sqrt3, 0.5 * sqrt3, -0.5 * sqrt2, 0);
auxB.fiber = 0.5 * Math.PI;


shiftA.isom.makeTranslation(auxA);
sinftAInv.isom.makeInvTranslation(auxA);
shiftB.isom.makeTranslation(auxB);
shiftBInv.isom.makeInvTranslation(auxB);
shiftWp.isom.makeTranslation(new Point().set(-1, 0, 0, 0, -height));
shiftWn.isom.makeTranslation(new Point().set(-1, 0, 0, 0, height));


// shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -height));
export default new TeleportationSet()
    .add(testSide2P, glslTestSide2P, shiftA, sinftAInv)
    .add(testSide1P, glslTestSide1P, sinftAInv, shiftA)
    .add(testSide2N, glslTestSide2N, shiftB, shiftBInv)
    .add(testSide1N, glslTestSide1N, shiftBInv, shiftB)
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);


// shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, height));

