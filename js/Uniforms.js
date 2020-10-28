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
    Isometry,
    serializeIsoms,
    serializePoints
} from "./Geometry.js";

import {
    Position
} from "./Position.js";

import {
    //fixOutsideCentralCell,
    createGenerators,
    invGenerators
} from "./Math.js";




//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

const time0 = new Date().getTime();

/**
 * Initialize the globals variables related to the scene (position, cell position, lattice, etc).
 */
function initGeometry() {

    globals.position = new Position();
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);



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

    PointLightObject(new Vector().set(1.2, 1.3, 0), lightColor1);
    PointLightObject(new Vector().set(-1.2, 1.3, 0), lightColor2);
    PointLightObject(new Vector().set(0, 0, 1.), lightColor3);
    PointLightObject(new Vector().set(-1., -1., -1.), lightColor4);
    let p = new Point().fromVector4(new Vector4(0, 0, 1, -1));
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
    //console.log(globals.position.facing.toLog());
    globals.material = new ShaderMaterial({
        uniforms: {

            screenResolution: {
                type: "v2",
                value: globals.screenResolution
            },

            time: {
                type: "f",
                value: (new Date().getTime()) - time0
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

            facing: {
                type: "m4",
                value: globals.position.facing
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


            //---uniforms for building the scene------
            lightPositions: {
                type: "v4",
                value: serializePoints(globals.lightPositions)
            },
            lightIntensities: {
                type: "v4",
                value: globals.lightIntensities
            },

            lightRad: {
                type: "float",
                value: globals.lightRad
            },

            globalObjectBoostMat: {
                type: "v4",
                value: globals.globalObjectPosition.boost.serialize()
            },
            globalSphereRad: {
                type: "f",
                value: 0.2
            },


            display: {
                type: "int",
                value: globals.display
            },

            planes: {
                type: "float",
                value: globals.planes
            },


            // ----- uniforms for rendering the scene -----
            colorScheme: {
                type: "int",
                value: globals.res
            },

            refl: {
                type: "float",
                value: globals.refl
            },
            foggy: {
                type: "float",
                value: globals.foggy
            },

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
    //
    globals.material.uniforms.time.value = (new Date().getTime()) - time0;
    //
    globals.material.uniforms.display.value = globals.display;

    globals.material.uniforms.colorScheme.value = globals.res;
    //    globals.material.uniforms.lightRad.value = globals.lightRad;
    globals.material.uniforms.foggy.value = globals.foggy;
    globals.material.uniforms.refl.value = globals.refl;
}



export {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial
};
