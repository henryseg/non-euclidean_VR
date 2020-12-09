import {Isometry} from "../../../../../js/geometry/euc/Isometry.js";
import {Matrix4} from "../../../../../js/lib/three.module.js";
import {Point} from "../../../../../js/geometry/euc/Point.js";

let assert = chai.assert;

describe('Isometry', function () {
    const identity = new Isometry();

    const theta1 = Math.PI / 6;
    const isom1 = new Isometry();
    isom1.matrix.set(
        Math.cos(theta1), -Math.sin(theta1), 0, 0,
        Math.sin(theta1), Math.cos(theta1), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    const theta2 = Math.PI / 12;
    const isom2 = new Isometry();
    isom2.matrix.set(
        Math.cos(theta2), -Math.sin(theta2), 0, 0,
        Math.sin(theta2), Math.cos(theta2), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    it('constructor', function () {
        const isom = new Isometry();
        const check = new Matrix4();
        assert.isOk(isom.matrix.equals(check));
    });

    it('equals', function () {
        assert.isOk(isom1.equals(isom1));
        assert.isNotOk(isom1.equals(isom2));
    });

    it('clone', function () {
        const test = isom1.clone();
        assert.isOk(test.equals(isom1));
    });

    it('copy', function () {
        const test = new Isometry().copy(isom1);
        assert.isOk(test.equals(isom1));
    });

    it('multiply', function () {
        const test = isom1.clone().multiply(isom2);
        const theta = theta1 + theta2;
        const check = new Isometry();
        check.matrix.set(
            Math.cos(theta), -Math.sin(theta), 0, 0,
            Math.sin(theta), Math.cos(theta), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        assert.isOk(test.matrix.equals(check.matrix));
    });

    it('invert', function () {
        const inv = isom1.clone().invert();
        const check1 = isom1.clone().multiply(inv);
        assert.isOk(check1.equals(identity));
        const check2 = inv.clone().multiply(isom1);
        assert.isOk(check2.equals(identity));
    });

    it('premultiply', function () {
        const test = isom1.clone().premultiply(isom2);
        const theta = theta1 + theta2;
        const check = new Isometry();
        check.matrix.set(
            Math.cos(theta), -Math.sin(theta), 0, 0,
            Math.sin(theta), Math.cos(theta), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        assert.isOk(test.matrix.equals(check.matrix));
    });

    it('makeTranslation', function () {
        const point = new Point(1, 2, 3);
        const isom = new Isometry().makeTranslation(point);
        const check = new Matrix4().set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        );
        assert.ok(isom.matrix.equals(check));
    });

    it('makeInvTranslation', function () {
        const point = new Point(1, 2, 3);
        const isom = new Isometry().makeInvTranslation(point);
        const check = new Matrix4().set(
            1, 0, 0, -1,
            0, 1, 0, -2,
            0, 0, 1, -3,
            0, 0, 0, 1
        );
        assert.ok(isom.matrix.equals(check));
    });
});