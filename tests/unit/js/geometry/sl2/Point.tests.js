import {SL2} from "../../../../../src/geometries/sl2/geometry/Utils.js";
import {Isometry, Point} from "../../../../../src/geometries/sl2/geometry/General.js";
import {Matrix4, Vector4} from "../../../../../src/lib/three.module.js";

let assert = chai.assert;

export function test() {
    describe('Point', function () {

        it('constructor', function () {
            let test;
            test = new Point();
            assert.isOk(test.proj.equals(new SL2(1, 0, 0, 0)) && test.fiber === 0);

            const c = 0.5 * Math.sqrt(2);
            test = new Point(c, c, 0, 0, 0.5 * Math.PI);
            assert.isOk(test.proj.equals(new SL2(c, c, 0, 0)) && test.fiber === 0.5 * Math.PI);
        });

        it('applyIsometry', function () {
            const c = 0.5 * Math.sqrt(2);
            const p = new Point(c, c, 0, 0, 0.5 * Math.PI);
            let isom, check;

            isom = new Isometry();
            check = p.clone().applyIsometry(isom);
            assert.isOk(check.proj.equals(p.proj));
            assert.isAtMost(Math.abs(check.fiber - p.fiber), 1e-10);


            isom = new Isometry().makeTranslation(p);
            check = new Point().applyIsometry(isom);
            assert.isOk(check.proj.equals(p.proj));
            assert.isAtMost(Math.abs(check.fiber - p.fiber), 1e-10);


        });
    });
}
