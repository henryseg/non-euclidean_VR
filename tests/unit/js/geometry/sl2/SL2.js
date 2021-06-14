import {SL2} from "../../../../../src/geometries/sl2/geometry/Utils.js";
import {Vector4} from "../../../../../src/lib/three.module.js";

let assert = chai.assert;

export function test() {
    describe('SL2', function () {

        it('constructor', function () {
            let test;
            test = new SL2();
            assert.isOk(test.equals(new Vector4(1, 0, 0, 0)));

            const c = 0.5 * Math.sqrt(2);
            test = new SL2(c, c, 0, 0);
            assert.isOk(test.equals(new Vector4(c, c, 0, 0)));
        });

    });
}
