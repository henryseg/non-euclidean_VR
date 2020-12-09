import {Vector} from "../../../../../js/geometry/abstract/Vector.js";
import {Matrix4, Quaternion} from "../../../../../js/lib/three.module.js";
import {Position as PositionEuc} from "../../../../../js/geometry/euc/Position.js";

let assert = chai.assert;
const EPS = 0.00000001;

describe('Vector', function () {

    it('applyMatrix4', function () {
        const v = new Vector(0, 0, 0);
        const m = new Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 1,
            0, 0, 1, 1,
            0, 0, 0, 1
        );
        const check = new Vector(0, 0, 0);
        assert.isOk(v.applyMatrix4(m).equals(check));
    });

    it('applyFacing', function(){
        let pos = new PositionEuc();
        pos.setQuaternion(new Quaternion(0,0,1,0));
        let v = new Vector(1,0,0);
        let test = v.applyFacing(pos);
        let check = new Vector(-1,0,0);
        assert.isOk(test.equals(check));

        pos.setQuaternion(new Quaternion(0,0,1,1).normalize());
        v = new Vector(1,0,0);
        test = v.applyFacing(pos);
        check = new Vector(0,1,0);
        assert.isAtMost(test.sub(check).lengthSq(), EPS);
    });
});