import {QuadRing} from "../../../../../src/utils/quadRing/QuadRing.js";
import {QuadRingElement} from "../../../../../src/utils/quadRing/QuadRingElement.js";

let assert = chai.assert;

export default function() {
    describe('QuadRingElement', function () {

        const ring = new QuadRing(3);

        it('add', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(5,-1);
            assert.isOk(e1.add(e2).equals(e3));
        });

        it('sum', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(5,-1);
            assert.isOk(ring.element().sum(e1,e2).equals(e3));
        });

        it('add', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(5,-1);
            assert.isOk(e1.add(e2).equals(e3));
        });

        it('multiply', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(-14,5);
            assert.isOk(e1.multiply(e2).equals(e3));
        });

        it('product', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(-14,5);
            assert.isOk(ring.element().product(e1,e2).equals(e3));
        });

        it('addProduct', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(-14,5);
            assert.isOk(ring.element().addProduct(e1,e2).equals(e3));
        });

        it('subProduct', function(){
            const e1 = ring.element(1,2);
            const e2 = ring.element(4,-3);
            const e3 = ring.element(14,-5);
            assert.isOk(ring.element().subProduct(e1,e2).equals(e3));
        });



    });
}