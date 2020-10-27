import {
    Vector4,
    Matrix4
} from "./module/three.module.js";

import {
    globals
} from "./Main.js";

import {
    Point,
    Vector,
    Isometry
} from "./Geometry.js";

import {
    Position
} from "./Position.js";


//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------


/**
 * @todo Change this to a method of the class Position
 */
function fixOutsideCentralCell(position) {

    let bestIndex = -1;
    //    let p = new Point().translateBy(position.boost);
    //    let klein = p.toKlein();
    //
    //
    //    const sqrt2 = Math.sqrt(2);
    //    const auxSurfaceM = Math.sqrt(sqrt2 - 1.);
    //    const threshold = sqrt2 * auxSurfaceM;
    //
    //    let nh = new Vector4().set(1, 0, 0, 0);
    //    let nv = new Vector4().set(0, 1, 0, 0);
    //    let nd1 = new Vector4().set(0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    //    let nd2 = new Vector4().set(-0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    //    let nfiber = new Vector4().set(0, 0, 0, 1);
    //
    //
    //
    //    if (klein.dot(nh) > threshold) {
    //        bestIndex = 1;
    //    }
    //    if (klein.dot(nd1) > threshold) {
    //        bestIndex = 5;
    //    }
    //    if (klein.dot(nv) > threshold) {
    //        bestIndex = 0;
    //    }
    //    if (klein.dot(nd2) > threshold) {
    //        bestIndex = 4;
    //    }
    //    if (klein.dot(nh) < -threshold) {
    //        bestIndex = 3;
    //    }
    //    if (klein.dot(nd1) < -threshold) {
    //        bestIndex = 7;
    //    }
    //    if (klein.dot(nv) < -threshold) {
    //        bestIndex = 2;
    //    }
    //    if (klein.dot(nd2) < -threshold) {
    //        bestIndex = 6;
    //    }
    //    if (klein.dot(nfiber) > Math.PI) {
    //        bestIndex = 9;
    //    }
    //    if (klein.dot(nfiber) < -Math.PI) {
    //        bestIndex = 8;
    //    }
    //
    //
    //    if (bestIndex !== -1) {
    //        position.translateBy(globals.gens[bestIndex]);
    //        return bestIndex;
    //    } else {
    return -1;
    // }
}


//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

/*

Moves the generators in the 'Geometry.js' file (or another geometry dependent file)?
Maybe create a class "lattice" to would store
- the generators
- the test function 'is inside fundamental domain ?'

 */

/**
 * Create the generators of a lattice and their inverses
 * The (2i+1)-entry of the output is the inverse of the (2i)-entry.
 * @returns {Array.<Isometry>} - the list of generators
 */
function createGenerators() { /// generators for the tiling by cubes.

    const sqrt2 = Math.sqrt(2);
    const auxSurfaceP = Math.sqrt(sqrt2 + 1.);

    const pointA1 = new Point();
    pointA1.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., auxSurfaceP, -auxSurfaceP);
    pointA1.fiber = 0.5 * Math.PI;
    let genA1 = new Isometry().set([pointA1]);

    const pointA1inv = new Point();
    pointA1inv.proj.set(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., -auxSurfaceP, auxSurfaceP);
    pointA1inv.fiber = -0.5 * Math.PI;
    let genA1inv = new Isometry().set([pointA1inv]);

    const pointA2 = new Point();
    pointA2.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -auxSurfaceP, auxSurfaceP);
    pointA2.fiber = 0.5 * Math.PI;
    let genA2 = new Isometry().set([pointA2]);

    const pointA2inv = new Point();
    pointA2inv.proj.set(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., auxSurfaceP, -auxSurfaceP);
    pointA2inv.fiber = -0.5 * Math.PI;
    let genA2inv = new Isometry().set([pointA2inv]);

    const pointB1 = new Point();
    pointB1.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., sqrt2 * auxSurfaceP, 0);
    pointB1.fiber = 0.5 * Math.PI;
    let genB1 = new Isometry().set([pointB1]);

    const pointB1inv = new Point();
    pointB1inv.proj.set(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., -sqrt2 * auxSurfaceP, 0);
    pointB1inv.fiber = -0.5 * Math.PI;
    let genB1inv = new Isometry().set([pointB1inv]);

    const pointB2 = new Point();
    pointB2.proj.set(0.5 * sqrt2 + 1., 0.5 * sqrt2 + 1., -sqrt2 * auxSurfaceP, 0);
    pointB2.fiber = 0.5 * Math.PI;
    let genB2 = new Isometry().set([pointB2]);

    const pointB2inv = new Point();
    pointB2inv.proj.set(0.5 * sqrt2 + 1., -0.5 * sqrt2 - 1., sqrt2 * auxSurfaceP, 0);
    pointB2inv.fiber = -0.5 * Math.PI;
    let genB2inv = new Isometry().set([pointB2inv]);

    const pointC = new Point();
    pointC.proj.set(-1, 0, 0, 0);
    pointC.fiber = 2 * Math.PI;
    let genC = new Isometry().set([pointC]);

    const pointCinv = new Point();
    pointCinv.proj.set(-1, 0, 0, 0);
    pointCinv.fiber = -2 * Math.PI;
    let genCinv = new Isometry().set([pointCinv]);

    return [genA1, genA1inv, genA2, genA2inv, genB1, genB1inv, genB2, genB2inv, genC, genCinv];
}

/**
 * Return the inverses of the generators
 *
 * @param {Array.<Isometry>} genArr - the isom
 * @returns {Array.<Isometry>} - the inverses
 */
function invGenerators(genArr) {

    return [
        genArr[1],
        genArr[0],
        genArr[3],
        genArr[2],
        genArr[5],
        genArr[4],
        genArr[7],
        genArr[6],
        genArr[9],
        genArr[8]
    ];
}






export {
    fixOutsideCentralCell,
    createGenerators,
    invGenerators
};
