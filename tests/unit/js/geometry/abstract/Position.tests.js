import {
    Isometry as IsometryEuc,
    Position as PositionEuc
} from "../../../../../src/geometries/euc/geometry/General.js";
import {Matrix4, Quaternion} from "../../../../../src/lib/three.module.js";

let assert = chai.assert;


export function test() {
    describe('Position', function () {

        it('constructor', function () {
            const pos = new PositionEuc();
            const checkIsom = new IsometryEuc();
            const checkQuat = new Quaternion();
            assert.isOk(pos.boost.equals(checkIsom), pos.quaternion.equals(checkQuat));
        });

        it('facing', function () {
            let pos = new PositionEuc();
            let check = new Matrix4();
            assert.isOk(pos.facing.equals(check));
        })

    });
}
