import {
    Vector4,
    Matrix4,
    ShaderMaterial,
    CubeTextureLoader
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
    let p = new Point().translateBy(position.boost);
    let klein = p.toKlein();


    const sqrt2 = Math.sqrt(2);
    const auxSurfaceM = Math.sqrt(sqrt2 - 1.);
    const threshold = sqrt2 * auxSurfaceM;

    let nh = new Vector4().set(1, 0, 0, 0);
    let nv = new Vector4().set(0, 1, 0, 0);
    let nd1 = new Vector4().set(0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    let nd2 = new Vector4().set(-0.5 * sqrt2, 0.5 * sqrt2, 0, 0);
    let nfiber = new Vector4().set(0, 0, 0, 1);


    if (klein.dot(nh) > threshold) {
        bestIndex = 1;
    }
    if (klein.dot(nd1) > threshold) {
        bestIndex = 5;
    }
    if (klein.dot(nv) > threshold) {
        bestIndex = 0;
    }
    if (klein.dot(nd2) > threshold) {
        bestIndex = 4;
    }
    if (klein.dot(nh) < -threshold) {
        bestIndex = 3;
    }
    if (klein.dot(nd1) < -threshold) {
        bestIndex = 7;
    }
    if (klein.dot(nv) < -threshold) {
        bestIndex = 2;
    }
    if (klein.dot(nd2) < -threshold) {
        bestIndex = 6;
    }
    if (klein.dot(nfiber) > Math.PI) {
        bestIndex = 9;
    }
    if (klein.dot(nfiber) < -Math.PI) {
        bestIndex = 8;
    }


    if (bestIndex !== -1) {
        position.translateBy(globals.gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }
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

/**
 * Serialize an array of isometries
 *
 * @param {Array.<Isometry>} isomArr - the isometries to serialize
 * @returns {Array.<Vector4>} - the serialized isometries
 */
function serializeIsoms(isomArr) {
    return isomArr.map(function (isom) {
        return isom.serialize();
    });
}

/**
 * Serialize an array of Points
 *
 * @param {Array.<Point>} pointArr - the isometries to serialize
 * @returns {Array.<Vector4>} - the serialized isometries
 */
function serializePoints(pointArr) {
    return pointArr.map(function (point) {
        return point.serialize();
    });
}

//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

const time0 = new Date().getTime();

/**
 * Initialize the globals variables related to the scene (position, cell position, lattice, etc).
 */
function initGeometry() {


    globals.position = new Position();
    // DEBUGGING
    // globals.position.boost.target = new Point().fromVector4(new Vector4(
    //     64.59408189989722,
    //     1653.9094370314726,
    //     1655.1706320854817,
    //     -1.6737163223953442
    // ));
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);

    let vectorLeft = globals.position.getRightVector(-globals.ipDist);
    globals.leftPosition = globals.position.clone().flow(vectorLeft);

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    globals.rightPosition = globals.position.clone().flow(vectorRight);

    //console.log("initial facing", globals.position.boost);
    //console.log("initial facing", globals.position.facing.toLog());


}

/**
 * Add a light to scene
 * @param {Vector} v - the position of the light is obtained by flowing v form the origin
 * @param {Vector4} colorInt - color and light intensity
 *
 * @todo Rethink the position of the light?
 */
function PointLightObject(v, colorInt) {
    let isom = new Position().flow(v).boost;
    let lp = new Point().translateBy(isom);
    globals.lightPositions.push(lp);
    globals.lightIntensities.push(colorInt);
}

/** @const {Vector4} lightColor1 - Color 1 (blue) */
const lightColor1 = new Vector4(68 / 256, 197 / 256, 203 / 256, 1); // blue
/** @const {Vector4} lightColor2 - Color 2 (yellow) */
const lightColor2 = new Vector4(252 / 256, 227 / 256, 21 / 256, 1); // yellow
/** @const {Vector4} lightColor3 - Color 3 (red)  */
const lightColor3 = new Vector4(245 / 256, 61 / 256, 82 / 256, 1); // red
/** @const {Vector4} lightColor4 - Color 4 (purple) */
const lightColor4 = new Vector4(256 / 256, 142 / 256, 226 / 256, 1); // purple


/**
 * Initialize the objects of the scene
 */
function initObjects() {

    PointLightObject(new Vector().set(1., 1.5, 0), lightColor1);
    PointLightObject(new Vector().set(-1, 1.5, 0), lightColor2);
    PointLightObject(new Vector().set(0, 0, 1.), lightColor3);
    PointLightObject(new Vector().set(-1., -1., -1.), lightColor4);
    let p = new Point();
    globals.globalObjectPosition = new Position().set(p.makeTranslation(), new Matrix4());
}

//----------------------------------------------------------------------------------------------------------------------
// Set up shader
//----------------------------------------------------------------------------------------------------------------------

/**
 * Pass all the data to the shader
 * @param fShader
 */
function setupMaterial(fShader) {

    globals.material = new ShaderMaterial({
        uniforms: {

            isStereo: {
                type: "bool",
                value: globals.vr
            },
            screenResolution: {
                type: "v2",
                value: globals.screenResolution
            },
            lightIntensities: {
                type: "v4",
                value: globals.lightIntensities
            },
            //--- geometry dependent stuff here ---//
            //--- lists of stuff that goes into each invGenerator
            invGenerators: {
                type: "v4",
                value: serializeIsoms(globals.invGens)
            },
            //--- end of invGen stuff
            currentBoostMat: {
                type: "v4",
                value: globals.position.boost.serialize()
            },
            leftBoostMat: {
                type: "v4",
                value: globals.leftPosition.boost.serialize()
            },
            rightBoostMat: {
                type: "v4",
                value: globals.rightPosition.boost.serialize()
            },
            //currentBoost is an array
            facing: {
                type: "m4",
                value: globals.position.facing
            },
            leftFacing: {
                type: "m4",
                value: globals.leftPosition.facing
            },
            rightFacing: {
                type: "m4",
                value: globals.rightPosition.facing
            },
            cellBoostMat: {
                type: "v4",
                value: globals.cellPosition.boost.serialize()
            },
            invCellBoostMat: {
                type: "v4",
                value: globals.invCellPosition.boost.serialize()
            },
            cellFacing: {
                type: "m4",
                value: globals.cellPosition.facing
            },
            invCellFacing: {
                type: "m4",
                value: globals.invCellPosition.facing
            },
            lightPositions: {
                type: "v4",
                value: serializePoints(globals.lightPositions)
            },
            globalObjectBoostMat: {
                type: "v4",
                value: globals.globalObjectPosition.boost.serialize()
            },
            globalSphereRad: {
                type: "f",
                value: 0.2
            },
            earthCubeTex: { //earth texture to global object
                type: "t",
                value: new CubeTextureLoader().setPath('images/cubemap512/')
                    .load([ //Cubemap derived from http://www.humus.name/index.php?page=Textures&start=120
                        'posx.jpg',
                        'negx.jpg',
                        'posy.jpg',
                        'negy.jpg',
                        'posz.jpg',
                        'negz.jpg'
                    ])
            },
            modelHalfCube: {
                type: "f",
                value: 0.5
            },
            stereoScreenOffset: {
                type: "f",
                value: globals.stereoScreenOffset
            },
            time: {
                type: "f",
                value: (new Date().getTime()) - time0
            },
            display: {
                type: "int",
                value: globals.display
            },
            resol: {
                type: "int",
                value: globals.res
            },
            lightRad: {
                type: "float",
                value: globals.lightRad
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}

/**
 * Update the data passed to the shader.
 *
 * It seems that to be properly passed to the shader,
 * a uniform `foo` cannot be updated on the js side by a statement of the form
 * > foo = new_value_of_foo
 * One has to use a statement that alter the object `foo` e.g.
 * > foo. attribute = new_value of the attribute
 * (Maybe some subtleties in the pointer management ?)
 *
 * This can be an issue when passing float to the shader
 * (Remark: is foo += 1 totally equivalent to foo = foo + 1 in this context?)
 * This method is called each time `animate` is used (at every frame ?) and can be used to update uniforms
 * > g_material.uniforms.foo.value = new_value_of_foo
 */
function updateMaterial() {
    globals.material.uniforms.currentBoostMat.value = globals.position.boost.serialize();
    globals.material.uniforms.cellBoostMat.value = globals.cellPosition.boost.serialize();
    globals.material.uniforms.invCellBoostMat.value = globals.invCellPosition.boost.serialize();

    let vectorLeft = globals.position.getRightVector(-globals.ipDist);
    globals.leftPosition = globals.position.clone().flow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.serialize();
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    globals.rightPosition = globals.position.clone().flow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.serialize();
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;

    globals.material.uniforms.time.value = (new Date().getTime()) - time0;

    globals.material.uniforms.display.value = globals.display;
    globals.material.uniforms.resol.value = globals.res;
    // globals.material.uniforms.lightRad.value = globals.lightRad;
}


export {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators
};
