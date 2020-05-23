import {
    Vector4,
    ShaderMaterial,
    CubeTextureLoader
} from "./module/three.module.js";

import {
    globals
} from "./Main.js";

import {
    Point,
    Vector,
    Isometry,
    ORIGIN
} from "./Geometry.js";

import {
    Position
} from "./Position.js";


//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(position) {

    /*
    let bestIndex = -1;
    let p = new Vector4(0, 0, 0, 1).applyMatrix4(position.boost.matrix);
    //lattice basis divided by the norm square
    let v1 = new Vector4(GoldenRatio, -1., 0., 0.);
    let v2 = new Vector4(1., GoldenRatio, 0., 0.);
    let v3 = new Vector4(0., 0., 1. / z0, 0.);


    if (globals.display != 3) { //this turns off the vertical teleporation when there is no vertical syymetries
        if (p.dot(v3) > 0.5) {
            bestIndex = 5;
        }
        if (p.dot(v3) < -0.5) {
            bestIndex = 4;
        }
    }

    if (p.dot(v1) > 0.5) {
        bestIndex = 1;
    }
    if (p.dot(v1) < -0.5) {
        bestIndex = 0;
    }
    if (p.dot(v2) > 0.5) {
        bestIndex = 3;
    }
    if (p.dot(v2) < -0.5) {
        bestIndex = 2;
    }

    if (bestIndex !== -1) {
        position.translateBy(globals.gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }
     */
    return -1;
}


//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

/*

Moves the generators in the 'Geometry.js' file (or another geometry dependent file)?
Maybe create a class "lattice" to would store
- the generators
- the test function 'is inside fundamental dmain ?'

 */

/**
 * Create the generators of a lattice and their inverses
 * The (2i+1)-entry of the output is the inverse of the (2i)-entry.
 * @returns {Isometry[]} - the list of generators
 */
function createGenerators() { /// generators for the tiling by cubes.

    // TODO. Check the generators
    //  For the moment the elements are chosen totally at random.
    //  Not even sure they generate a discrete subgroup!

    const aux = 1;
    const gen0 = new Isometry().makeTranslation(aux, 0, Math.sqrt(aux * aux + 1), 0,);
    const gen1 = new Isometry().makeInvTranslation(aux, 0, Math.sqrt(aux * aux + 1), 0);
    const gen2 = new Isometry().makeTranslation(0, aux, Math.sqrt(aux * aux + 1), 0);
    const gen3 = new Isometry().makeInvTranslation(0, aux, Math.sqrt(aux * aux + 1), 0);
    const gen4 = new Isometry().makeTranslation(0, 0, 0, 1);
    const gen5 = new Isometry().makeInvTranslation(0, 0, 0, 1);

    return [gen0, gen1, gen2, gen3, gen4, gen5];
}

/**
 * Return the inverses of the generators
 *
 * @param {Array.<Isometry>} genArr - the isom
 * @returns {Array.<Isometry>} - the inverses
 */
function invGenerators(genArr) {
    return [genArr[1], genArr[0], genArr[3], genArr[2], genArr[5], genArr[4]];
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

//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

const time0 = new Date().getTime();

/**
 * Initialize the globals variables related to the scene (position, cell position, lattie, etc).
 */
function initGeometry() {
    globals.position = new Position();
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);

    let vectorLeft = globals.position.getRightVector(-globals.ipDist);
    globals.leftPosition = globals.position.clone().flow(vectorLeft);

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    globals.rightPosition = globals.position.clone().flow(vectorRight);
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
    console.log('lights', globals.lightPositions);
    globals.globalObjectPosition = new Position().flow(new Vector().set(0, 0, -1));
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
                value: globals.lightPositions
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
            res: {
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
    //globals.leftPosition = globals.position.clone().flow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.serialize();
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    //globals.rightPosition = globals.position.clone().flow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.serialize();
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;

    globals.material.uniforms.time.value = (new Date().getTime()) - time0;

    globals.material.uniforms.display.value = globals.display;
    globals.material.uniforms.res.value = globals.res;
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
