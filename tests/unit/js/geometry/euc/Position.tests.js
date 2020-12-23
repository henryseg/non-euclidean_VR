import {Position} from "../../../../../js/geometry/euc/Position.js";
import {Vector} from "../../../../../js/core/abstract/Vector.js";
import {Matrix4, Quaternion} from "../../../../../js/lib/three.module.js";

let assert = chai.assert;

export function test() {
    describe('Position', function () {

        it('flow', function () {
            const pos = new Position();
            const v = new Vector(1, 2, 3);
            pos.flow(v);
            const check = new Matrix4().set(
                1, 0, 0, 1,
                0, 1, 0, 2,
                0, 0, 1, 3,
                0, 0, 0, 1
            );
            assert.isOk(pos.boost.matrix.equals(check));
            assert.isOk(pos.quaternion.equals(new Quaternion()))
        });
    });
}
