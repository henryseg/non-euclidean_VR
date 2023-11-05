import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Point, Vector} from "../../geometry/General.js";
import {Vector4} from "three";

const group = new Group();

const sqrt2 = Math.sqrt(2);
const auxSurfaceP = Math.sqrt(sqrt2 + 1.);
const auxSurfaceM = Math.sqrt(sqrt2 - 1.);
const threshold = sqrt2 * auxSurfaceM;
const height = 2 * Math.PI;

const nh = new Vector4(1, 0, 0, 0);
const nv = new Vector4(0, 1, 0, 0);
const nd1 = new Vector4(0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
const nd2 = new Vector4(-0.5 * sqrt2, 0.5 * sqrt2, 0, 0);


function testSideHP(p) {
    const klein = p.toKlein();
    return klein.dot(nh) > threshold;
}

// language=GLSL
const glslTestSideHP = `//
bool testSideHP(Point p){
    vec4 nh = vec4(1, 0, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nh) > ${threshold};
}
`;

function testSideHN(p) {
    const klein = p.toKlein();
    return klein.dot(nh) < -threshold;
}

// language=GLSL
const glslTestSideHN = `//
bool testSideHN(Point p){
    vec4 nh = vec4(1, 0, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nh) < -${threshold};
}
`;

function testSideVP(p) {
    const klein = p.toKlein();
    return klein.dot(nv) > threshold;
}

// language=GLSL
const glslTestSideVP = `//
bool testSideVP(Point p){
    vec4 nv = vec4(0, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nv) > ${threshold};
}
`;

function testSideVN(p) {
    const klein = p.toKlein();
    return klein.dot(nv) < -threshold;
}

// language=GLSL
const glslTestSideVN = `//
bool testSideVN(Point p){
    vec4 nv = vec4(0, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nv) < -${threshold};
}
`;

function testSideD1P(p) {
    const klein = p.toKlein();
    return klein.dot(nd1) > threshold;
}

// language=GLSL
const glslTestSideD1P = `//
bool testSideD1P(Point p){
    vec4 nd1 = 0.5 * ${sqrt2} * vec4(1, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nd1) > ${threshold};
}
`;

function testSideD1N(p) {
    const klein = p.toKlein();
    return klein.dot(nd1) < -threshold;
}

// language=GLSL
const glslTestSideD1N = `//
bool testSideD1N(Point p){
    vec4 nd1 = 0.5 * ${sqrt2} * vec4(1, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nd1) < -${threshold};
}
`;


function testSideD2P(p) {
    const klein = p.toKlein();
    return klein.dot(nd2) > threshold;
}

// language=GLSL
const glslTestSideD2P = `//
bool testSideD2P(Point p){
    vec4 nd2 = 0.5 * ${sqrt2} * vec4(-1, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nd2) > ${threshold};
}
`;

function testSideD2N(p) {
    const klein = p.toKlein();
    return klein.dot(nd2) < -threshold;
}

// language=GLSL
const glslTestSideD2N = `//
bool testSideD2N(Point p){
    vec4 nd2 = 0.5 * ${sqrt2} * vec4(-1, 1, 0, 0);
    vec4 klein = toKlein(p);
    return dot(klein, nd2) < -${threshold};
}
`;

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
const shiftA1 = group.element();
const shiftA1Inv = group.element();
const shiftB1 = group.element();
const shiftB1Inv = group.element();
const shiftA2 = group.element();
const shiftA2Inv = group.element();
const shiftB2 = group.element();
const shiftB2Inv = group.element();
const shiftWp = group.element();
const shiftWn = group.element();

const auxA1 = new Point();
const auxB1 = new Point();
const auxA2 = new Point();
const auxB2 = new Point();
auxA1.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., auxSurfaceP, -auxSurfaceP);
auxA1.fiber = 0.5 * Math.PI;
auxB1.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., sqrt2 * auxSurfaceP, 0);
auxB1.fiber = 0.5 * Math.PI;
auxA2.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -auxSurfaceP, auxSurfaceP);
auxA2.fiber = 0.5 * Math.PI;
auxB2.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -sqrt2 * auxSurfaceP, 0);
auxB2.fiber = 0.5 * Math.PI;


shiftA1.isom.makeTranslation(auxA1);
shiftA1Inv.isom.makeInvTranslation(auxA1);
shiftB1.isom.makeTranslation(auxB1);
shiftB1Inv.isom.makeInvTranslation(auxB1);
shiftA2.isom.makeTranslation(auxA2);
shiftA2Inv.isom.makeInvTranslation(auxA2);
shiftB2.isom.makeTranslation(auxB2);
shiftB2Inv.isom.makeInvTranslation(auxB2);
shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -height));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, height));


export default new TeleportationSet()
    .add(testSideHP, glslTestSideHP, shiftA1Inv, shiftA1)
    .add(testSideHN, glslTestSideHN, shiftA2Inv, shiftA2)
    .add(testSideVP, glslTestSideVP, shiftA1, shiftA1Inv)
    .add(testSideVN, glslTestSideVN, shiftA2, shiftA2Inv)
    .add(testSideD1P, glslTestSideD1P, shiftB1Inv, shiftB1)
    .add(testSideD1N, glslTestSideD1N, shiftB2Inv, shiftB2)
    .add(testSideD2P, glslTestSideD2P, shiftB1, shiftB1Inv)
    .add(testSideD2N, glslTestSideD2N, shiftB2, shiftB2Inv)
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);
