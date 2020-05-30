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
    SceneBuilder
} from './SceneBuilder.js';


const bgColor = new Vector4(0.1, 0.1, 0.1, 0.1);

let sceneBuilder = new SceneBuilder(bgColor);

//DEFINE THE LIGHTS

const posLight1 = new Vector4(1., 1.5, 0, 1);
const posLight2 = new Vector4(-1, 1.5, 0, 1);
const posLight3 = new Vector4(0, 0, 1., 1);
const posLight4 = new Vector4(-1., -1., -1., 1);

const lightColor1 = new Vector4(68 / 256, 197 / 256, 203 / 256, 1); // blue
const lightColor2 = new Vector4(252 / 256, 227 / 256, 21 / 256, 1); // yellow
const lightColor3 = new Vector4(245 / 256, 61 / 256, 82 / 256, 1); // red
const lightColor4 = new Vector4(256 / 256, 142 / 256, 226 / 256, 1); // purple

sceneBuilder.addLight(posLight1, lightColor1, 0.1, true);
sceneBuilder.addLight(posLight2, lightColor2, 0.1, true);
sceneBuilder.addLight(posLight3, lightColor3, 0.1, true);
sceneBuilder.addLight(posLight4, lightColor4, 0.1, true);


const localLightColor = new Vector4(.8, .8, .8, 0.5);
const localLightPos = new Vector4(0.5, 0.5, 0.5, 1);
sceneBuilder.addLight(localLightPos, localLightColor, 0.1, false);

//DEFINE THE GLOBAL OBJECTS

const sphCenter1 = new Vector4(0, 0, -0.8, 1);
const sphColor1 = new Vector4(1, 0, 1, 1);
const axes1 = new Vector3(1, 0.5, 1);
sceneBuilder.addEllipsoid(sphCenter1, axes1, 0.5, sphColor1, true);

const sphCenter2 = new Vector4(1, 1, -0.5, 1);
const sphColor2 = new Vector4(0, 1, 1, 1);
sceneBuilder.addSphere(sphCenter2, 0.2, sphColor2, true);

//DEFINE THE LOCAL OBJECTS

const localSphCenter = new Vector4(0, 0, 0, 1);
const localSphColor = new Vector4(1, 1, 1, 1);
//sceneBuilder.addSphere(localSphCenter, 0.2, localSphColor, false);

sceneBuilder.addSphereComplement(localSphCenter, 0.68, localSphColor, false);



//----------------------------------------------------------------------------------------------------------------------
//	Geometry Constants & Lattice Vectors in Tangent Space
//----------------------------------------------------------------------------------------------------------------------


//The three vectors specifying the directions / lengths of the generators of the lattice
const V1 = new Vector4(1, 0, 0., 0.);
const V2 = new Vector4(0, 1., 0., 0.);
const V3 = new Vector4(0., 0., 1., 0.);

//create a list of these vectors to send over to the shader
const genVectors = [V1, V2, V3];
//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(position) {
    let bestIndex = -1;
    let p = new Vector4(0, 0, 0, 1).applyMatrix4(position.boost.matrix);

    //lattice basis divided by the norm square
    let v1 = V1;
    let v2 = V2;
    let v3 = V3;

    // if (globals.display != 2) { //this turns off the vertical teleporation when there is no vertical syymetries
    if (p.dot(v3) > 0.5) {
        bestIndex = 5;
    }
    if (p.dot(v3) < -0.5) {
        bestIndex = 4;
    }
    //  }

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
}


//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const gen0 = new Isometry().makeLeftTranslation(V1);
    const gen1 = new Isometry().makeInvLeftTranslation(V1);
    const gen2 = new Isometry().makeLeftTranslation(V2);
    const gen3 = new Isometry().makeInvLeftTranslation(V2);
    const gen4 = new Isometry().makeLeftTranslation(V3);
    const gen5 = new Isometry().makeInvLeftTranslation(V3);


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
//	Fix up some lights
//----------------------------------------------------------------------------------------------------------------------


export {
    genVectors,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix,
    sceneBuilder
};
