import {SL2} from "../../../../../js/geometries/sl2/geometry/Utils.js";
import {Isometry, Point} from "../../../../../js/geometries/sl2/geometry/General.js";
import {Matrix4, Vector4} from "../../../../../js/lib/three.module.js";

let assert = chai.assert;

export function test() {
    describe('Isometry', function () {

        it('constructor', function () {
            const isom = new Isometry();
            const check = new Matrix4();
            assert.isOk(isom.matrix.equals(check) && isom.fiber === 0);
        });

        it('makeTranslation', function () {
            const c = 0.5 * Math.sqrt(2);
            const p = new Point(c, c, 0, 0, Math.PI * 0.5);
            const isom = new Isometry().makeTranslation(p);
            const check = new SL2().applyMatrix4(isom.matrix);
            assert.isOk(check.equals(p.proj));
        });

        it('multiply', function () {
            const c = 0.5 * Math.sqrt(2);
            const p = new Point(c, c, 0, 0, Math.PI * 0.5);
            const isom = new Isometry().makeTranslation(p);
            const test = new Isometry().multiply(isom);
            assert.isOk(isom.matrix.equals(test.matrix));
            assert.isAtMost(Math.abs(isom.fiber - test.fiber), 1e-10);
        });
    });
}
