import {test as testAbsVector} from "./unit/js/geometry/abstract/Vector.tests.js";
import {test as testAbsPosition} from "./unit/js/geometry/abstract/Position.tests.js";
import {test as testEucIsom} from "./unit/js/geometry/euc/Isometry.tests.js";
import {test as testEucPoint} from "./unit/js/geometry/euc/Point.tests.js";
import {test as testEucPosition} from "./unit/js/geometry/euc/Position.tests.js";


describe('Abstract', function () {
    testAbsVector();
    testAbsPosition();
});

describe('Euc', function() {
    testEucIsom();
    testEucPoint();
    testEucPosition();
})


