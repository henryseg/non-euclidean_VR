import {test as testAbsVector} from "./unit/js/geometry/abstract/Vector.tests.js";
import {test as testAbsPosition} from "./unit/js/geometry/abstract/Position.tests.js";

import {test as testEucIsom} from "./unit/js/geometry/euc/Isometry.tests.js";
import {test as testEucPoint} from "./unit/js/geometry/euc/Point.tests.js";
import {test as testEucPosition} from "./unit/js/geometry/euc/Position.tests.js";

import {test as testSL2} from "./unit/js/geometry/sl2/SL2.js";
import {test as testSL2Isom} from "./unit/js/geometry/sl2/Isometry.tests.js";
import {test as testSL2Point} from "./unit/js/geometry/sl2/Point.tests.js";

import testQuadRingElement from "./unit/js/utils/quadRing/QuadRingElement.tests.js"
import testQuadMatrix4 from "./unit/js/utils/quadRing/QuadRingMatrix4.tests.js"


describe('Abstract', function () {
    testAbsVector();
    testAbsPosition();
});

describe('Euc', function () {
    testEucIsom();
    testEucPoint();
    testEucPosition();
})

describe('SL2', function () {
    testSL2();
    testSL2Isom();
    testSL2Point();
})

describe('QuadRing', function () {
    testQuadRingElement();
    testQuadMatrix4();
})



