import {Point} from "../../../../../js/geometry/euc/Point.js";
import {Vector4} from "../../../../../js/lib/three.module.js";
import {Isometry} from "../../../../../js/geometry/euc/Isometry.js";

let assert = chai.assert;


describe('Point', function () {
    const origin = new Point();

    it('constructor', function () {
        let point = new Point();
        let check = new Vector4(0, 0, 0, 1);
        assert.isOk(point.coords.equals(check));
        point = new Point(1, 2, 3);
        check = new Vector4(1, 2, 3, 1);
        assert.isOk(point.coords.equals(check));
    });

    it('equals', function () {
        let point1 = new Point(1, 2, 3);
        let point2 = new Point(1, 2, 3);
        assert.isOk(point1.equals(point2));
        point2 = new Point(2, 3, 5);
        assert.isNotOk(point1.equals(point2));
    });

    it('clone', function () {
        let point1 = new Point(1, 2, 3);
        let point2 = point1.clone();
        assert.isOk(point1.equals(point2));
    });

    it('copy', function () {
        let point1 = new Point(1, 2, 3);
        let point2 = new Point().copy(point1);
        assert.isOk(point1.equals(point2));
    });

    it('applyIsometry', function () {
        let isom = new Isometry();
        isom.matrix.set(
            1, 0, 0, 1,
            0, 1, 0, 2,
            0, 0, 1, 3,
            0, 0, 0, 1
        );
        let point = new Point();
        let check = new Point(1, 2, 3);
        assert.isOk(point.applyIsometry(isom).equals(check));
    });
});