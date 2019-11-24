import {
    Vector3,
    Vector4,
    Matrix4,
    ShaderMaterial,
    CubeTextureLoader,
    DataTexture3D,
    LinearFilter,
    FloatType,
    RedFormat
} from "./module/three.module.js";
import {
    NRRDLoader
} from "./module/NRRDLoader.js";

import {
    globals
} from './Main.js';
import {
    Isometry
} from "./Isometry.js";
import {
    Position,
    ORIGIN
} from "./Position.js";


//----------------------------------------------------------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------------------------------------------------------

let cubeHalfWidth = 0.5;

const GoldenRatio = 0.5 * (1 + Math.sqrt(5.)); //1.618033988749895;
const z0 = 2 * Math.log(GoldenRatio);
//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(position) {
    //    let bestIndex = -1;
    //    let p = ORIGIN.clone().translateBy(position.boost);
    //    //lattice basis divided by the norm square
    //    let v1 = new Vector4(GoldenRatio, -1., 0., 0.);
    //    let v2 = new Vector4(1., GoldenRatio, 0., 0.);
    //    let v3 = new Vector4(0., 0., 1. / z0, 0.);
    //
    //    if (p.dot(v3) > 0.5) {
    //        bestIndex = 5;
    //    }
    //    if (p.dot(v3) < -0.5) {
    //        bestIndex = 4;
    //    }
    //
    //    if (p.dot(v1) > 0.5) {
    //        bestIndex = 1;
    //    }
    //    if (p.dot(v1) < -0.5) {
    //        bestIndex = 0;
    //    }
    //    if (p.dot(v2) > 0.5) {
    //        bestIndex = 3;
    //    }
    //    if (p.dot(v2) < -0.5) {
    //        bestIndex = 2;
    //    }
    //
    //    if (bestIndex !== -1) {
    //        position.translateBy(globals.gens[bestIndex]);
    //        return bestIndex;
    //    } else {
    //        return -1;
    //    }
    return -1;
}




//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const denominator = GoldenRatio + 2;

    const gen0 = new Isometry().makeLeftTranslation(GoldenRatio / denominator, -1. / denominator, 0.);
    const gen1 = new Isometry().makeInvLeftTranslation(GoldenRatio / denominator, -1. / denominator, 0.);
    const gen2 = new Isometry().makeLeftTranslation(1. / denominator, GoldenRatio / denominator, 0.);
    const gen3 = new Isometry().makeInvLeftTranslation(1. / denominator, GoldenRatio / denominator, 0.);


    // console.log(z0);
    const gen4 = new Isometry().makeLeftTranslation(0., 0., z0);
    const gen5 = new Isometry().makeLeftTranslation(0., 0., -z0);

    //    const gen4 = new Isometry().set([new Matrix4().makeTranslation(0, 0, z0)]);
    //    const gen5 = new Isometry().set([new Matrix4().makeTranslation(0, 0, -z0)]);


    return [gen0, gen1, gen2, gen3, gen4, gen5];
}

function invGenerators(genArr) {
    return [genArr[1], genArr[0], genArr[3], genArr[2], genArr[5], genArr[4]];
}

//Unpackage boosts into their components (for hyperbolic space, just pull out the matrix which is the first component)
function unpackageMatrix(genArr) {
    let out = [];
    for (let i = 0; i < genArr.length; i++) {
        out.push(genArr[i].matrix);
    }
    return out
}


//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here


function initGeometry() {
    globals.position = new Position();
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);
    invGensMatrices = unpackageMatrix(globals.invGens);

    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
}


function PointLightObject(v, colorInt) {
    //position is a euclidean Vector4
    let isom = new Position().localFlow(v).boost;
    let lp = ORIGIN.clone().translateBy(isom);
    globals.lightPositions.push(lp);
    globals.lightIntensities.push(colorInt);
}

//DEFINE THE LIGHT COLORS
const lightColor1 = new Vector4(68 / 256, 197 / 256, 203 / 256, 1); // blue
const lightColor2 = new Vector4(252 / 256, 227 / 256, 21 / 256, 1); // yellow
const lightColor3 = new Vector4(245 / 256, 61 / 256, 82 / 256, 1); // red
const lightColor4 = new Vector4(256 / 256, 142 / 256, 226 / 256, 1); // purple


function initObjects() {
    PointLightObject(new Vector3(1., 1.5, 0), lightColor1);
    PointLightObject(new Vector3(-1, 1.5, 0), lightColor2);
    PointLightObject(new Vector3(0, 0.5, 1.), lightColor3);
    PointLightObject(new Vector3(-1., -1., -1.), lightColor4);

    globals.globalObjectPosition = new Position().localFlow(new Vector3(0, 0, -1));
}

//----------------------------------------------------------------------------------------------------------------------
// Set up shader
//----------------------------------------------------------------------------------------------------------------------

// status of the textures: number of textures already loaded
let textureStatus = 0;

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
                type: "m4",
                value: invGensMatrices
            },
            //--- end of invGen stuff
            currentBoostMat: {
                type: "m4",
                value: globals.position.boost.matrix
            },
            leftBoostMat: {
                type: "m4",
                value: globals.leftPosition.boost.matrix
            },
            rightBoostMat: {
                type: "m4",
                value: globals.rightPosition.boost.matrix
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
                type: "m4",
                value: globals.cellPosition.boost.matrix
            },
            invCellBoostMat: {
                type: "m4",
                value: globals.invCellPosition.boost.matrix
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
                type: "m4",
                value: globals.globalObjectPosition.boost.matrix
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
            lookupTableX: {
                // value of the table will be setup below
                type: "t"
            },
            lookupTableY: {
                // value of the table will be setup below
                type: "t"
            },
            lookupTableZ: {
                // value of the table will be setup below
                type: "t"
            },
            lookupTableTheta: {
                // value of the table will be setup below
                type: "t"
            },
            lookupTablePhi: {
                // value of the table will be setup below
                type: "t"
            },
            depth: {
                type: "f",
                value: depth
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });

    let file = 'test2';
    //let file = 'euc';
    //let file = 'testhgp';

    // TODO. Factorize this!
    new NRRDLoader().load("../texture/" + file + "_x.nrrd", function (volume) {
        let texture = new DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.unpackAlignment = 1;
        globals.material.uniforms.lookupTableX.value = texture;
        textureStatus += 1;
    });
    new NRRDLoader().load("../texture/" + file + "_y.nrrd", function (volume) {
        let texture = new DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.unpackAlignment = 1;
        globals.material.uniforms.lookupTableY.value = texture;
        textureStatus += 1;
    });
    new NRRDLoader().load("../texture/" + file + "_z.nrrd", function (volume) {
        let texture = new DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.unpackAlignment = 1;
        globals.material.uniforms.lookupTableZ.value = texture;
        textureStatus += 1;
    });
    new NRRDLoader().load("../texture/" + file + "_theta.nrrd", function (volume) {
        let texture = new DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.unpackAlignment = 1;
        globals.material.uniforms.lookupTableTheta.value = texture;
        textureStatus += 1;
    });
    new NRRDLoader().load("../texture/" + file + "_phi.nrrd", function (volume) {
        let texture = new DataTexture3D(volume.data, volume.xLength, volume.yLength, volume.zLength);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.unpackAlignment = 1;
        globals.material.uniforms.lookupTablePhi.value = texture;
        textureStatus += 1;
    });
}

let depth = -1;

function updateMaterial() {
    /*
        It seems that to be properly passed to the shader,
        a uniform `foo` cannot be updated on the js side by a statement of the form
        > foo = new_value_of_foo
        One has to use a statement that alter the object `foo` e.g.
        > foo. attribute = new_value of the attribute
        (Maybe some subtleties in the pointer management ?)

        This can be an issue when passing float to the shader
        (Remark: is foo += 1 totally equivalent to foo = foo + 1 in this context?)
        This method is called each time `animate` is used (at every frame ?) and can be used to update uniforms
        > g_material.uniforms.foo.value = new_value_of_foo

     */

    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.matrix;
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.matrix;
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;

    if (textureStatus === 5) {
        depth = depth + 1;
    }
    if (depth % 10 == 0) {
        globals.material.uniforms.depth.value = depth;
    }

}

export {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix
};
