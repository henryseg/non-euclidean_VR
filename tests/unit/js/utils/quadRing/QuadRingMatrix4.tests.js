import * as utils from "../../../../../js/utils.js";
import {QuadRing} from "../../../../../js/utils/quadRing/QuadRing.js";
import {QuadRingElement} from "../../../../../js/utils/quadRing/QuadRingElement.js";

let assert = chai.assert;

export default function() {
    describe('QuadRingMatrix4', function () {

        const ring = new QuadRing(3);

        it('getEntry', function () {
            const m = ring.matrix4();
            assert.isOk(m.getEntry(0,0).equals(ring.one));
            assert.isOk(m.getEntry(0,1).equals(ring.zero));
        });

        it('setEntry', function () {
            const m = ring.matrix4();
            m.setEntry(1,2, ring.one);
            assert.isOk(m.getEntry(1,2).equals(ring.one));
        });

        it('multiply', function () {
            const m1 = ring.matrix4();
            const m2 = ring.matrix4();
            const m3 = ring.matrix4();
            assert.isOk(m1.multiply(m2).equals(m3));
        });


    });
}