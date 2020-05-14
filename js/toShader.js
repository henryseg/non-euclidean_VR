import {
    Vector3,
    Vector4,
    ShaderMaterial,
    CubeTextureLoader
} from "./module/three.module.js";

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
import {
    createGenerators,
    invGenerators,
    unpackageMatrix,
    genVectors,
    PointLightObject,
    lightColors
} from './Scene.js';






//----------------------------------------------------------------------------------------------------------------------
// Computing other quantities the shader will want
//----------------------------------------------------------------------------------------------------------------------


let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here
const time0 = new Date().getTime();








//----------------------------------------------------------------------------------------------------------------------
// Initializing Things
//----------------------------------------------------------------------------------------------------------------------





function initGeometry() {
    globals.position = new Position();
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);
    globals.invGensMatrices = unpackageMatrix(globals.invGens);

    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
}





function initObjects() {
    PointLightObject(new Vector3(1., 1., 0), lightColors[0]);
    PointLightObject(new Vector3(-1, 0, 0), lightColors[1]);
    PointLightObject(new Vector3(0, 0, 1), lightColors[2]);
    PointLightObject(new Vector3(-1., -1., -1.), lightColors[3]);

    globals.globalObjectPosition = new Position().localFlow(new Vector3(0, 0, -1.5));
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
                value: globals.invGensMatrices
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

            //Sending the Lattice Generators over to GLSL
            V1: {
                type: "v4",
                value: genVectors[0]
            },

            V2: {
                type: "v4",
                value: genVectors[1]
            },
            V3: {
                type: "v4",
                value: genVectors[2]
            },

            stereoScreenOffset: {
                type: "f",
                value: globals.stereoScreenOffset
            },
            time: {
                type: "f",
                value: ((new Date().getTime()) - time0) / 1000.
            },
            display: {
                type: "int",
                value: globals.display
            },

            yourRad: {
                type: "f",
                value: globals.yourRad
            },

            res: {
                type: "f",
                value: globals.res
            },
            mirror: {
                type: "f",
                value: globals.mirror
            },
            brightness: {
                type: "float",
                value: globals.brightness
            },
            renderShadow: {
                type: "bool",
                value: globals.renderShadow
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}


function updateMaterial() {

    //        It seems that to be properly passed to the shader,
    //        a uniform `foo` cannot be updated on the js side by a statement of the form
    //        > foo = new_value_of_foo
    //        One has to use a statement that alter the object `foo` e.g.
    //        > foo. attribute = new_value of the attribute
    //        (Maybe some subtleties in the pointer management ?)
    //
    //        This can be an issue when passing float to the shader
    //        (Remark: is foo += 1 totally equivalent to foo = foo + 1 in this context?)
    //        This method is called each time `animate` is used (at every frame ?) and can be used to update uniforms
    //        > g_material.uniforms.foo.value = new_value_of_foo



    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.matrix;
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.matrix;
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;

    globals.material.uniforms.time.value = ((new Date().getTime()) - time0) / 1000.;

    globals.material.uniforms.display.value = globals.display;
    globals.material.uniforms.yourRad.value = globals.yourRad;
    globals.material.uniforms.res.value = globals.res;
    globals.material.uniforms.mirror.value = globals.mirror;
    globals.material.uniforms.renderShadow.value = globals.renderShadow;
    // globals.material.uniforms.lightRad.value = globals.lightRad;

}

export {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial
};
