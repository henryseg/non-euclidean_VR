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




//----------------------------------------------------------------------------------------------------------------------
//	Geometry Of the Model and Projective Model
//----------------------------------------------------------------------------------------------------------------------



function projPoint(pt) {
    //euclidean space is affine; is its own model
    return new Vector4(pt.x, pt.y, pt.z, 1.);
}

function projDirection(pt) {
    // make the last coordinate in the affine model zero
    let p = projPoint(pt);
    return new Vector4(p.x, p.y, p.z, 0.);
}




//----------------------------------------------------------------------------------------------------------------------
//	Geometry Constants & Lattice Vectors in Tangent Space
//----------------------------------------------------------------------------------------------------------------------


//The three vectors specifying the directions / lengths of the generators of the lattice.
const G1 = new Vector4(1, 0, 0., 0.);
const G2 = new Vector4(0, 1, 0., 0.);
const G3 = new Vector4(0., 0., 1, 0.);

let Generators = [G1, G2, G3];





//the vectors of half the length determine transformations taking the origin to the faces of the fundamental domain
let V1 = Generators[0].clone().multiplyScalar(0.5);
let V2 = Generators[1].clone().multiplyScalar(0.5);
let V3 = Generators[2].clone().multiplyScalar(0.5);

//what we actually need is the image of these in the projective models, as this tells us where the faces of the fundamental domains are


//The three vectors specifying the directions / lengths of the generators of the lattice  IN THE PROJECTIVE MODEL
//length of each vector is the HALF LENGTH of the generator: its the length needed to go from the center to the face
const pV1 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V1)));
const pV2 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V2)));
const pV3 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V3)));

//the lengths and directions of these vectors are important quantities for writing the teleport-back-to-central-cell commands
const lV1 = pV1.length();
const lV2 = pV2.length();
const lV3 = pV3.length();

//create a list of these vectors
let pGenVectors = [pV1, pV2, pV3];



//From this define a function which produces the vectors which point at the faces of the fundamental domain in the affine model
//this is a computationally easy way to deal with teleporting back to the fundamental domain

//function projModelVects(Generators) {
//
//    //the vectors of half the length determine transformations taking the origin to the faces of the fundamental domain
//    let V1 = Generators[0].clone().multiplyScalar(0.5);
//    let V2 = Generators[1].clone().multiplyScalar(0.5);
//    let V3 = Generators[2].clone().multiplyScalar(0.5);
//
//    //what we actually need is the image of these in the projective models, as this tells us where the faces of the fundamental domains are
//
//
//    //The three vectors specifying the directions / lengths of the generators of the lattice  IN THE PROJECTIVE MODEL
//    //length of each vector is the HALF LENGTH of the generator: its the length needed to go from the center to the face
//    const pV1 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V1)));
//    const pV2 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V2)));
//    const pV3 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V3)));
//
//    //the lengths and directions of these vectors are important quantities for writing the teleport-back-to-central-cell commands
//    const lV1 = pV1.length();
//    const lV2 = pV2.length();
//    const lV3 = pV3.length();
//
//    //create a list of these vectors
//    let pV = [pV1, pV2, pV3];
//
//    return pV;
//}





//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(position) {
    let bestIndex = -1;
    //the vector in the geometry corresponding to our position
    let q = ORIGIN.clone().applyMatrix4(position.boost.matrix);
    //now project this into the projective model
    let p = projDirection(q);


    //points in projective model on 
    let v1 = pV1 / lV1;
    let v2 = pV2 / lV2;
    let v3 = pV3 / lV3;

    if (p.dot(v1) > lV1) {
        bestIndex = 1;
    }
    if (p.dot(v1) < -lV1) {
        bestIndex = 0;
    }
    if (p.dot(v2) > lV2) {
        bestIndex = 3;
    }
    if (p.dot(v2) < -lV2) {
        bestIndex = 2;
    }

    if (p.dot(v3) > lV3) {
        bestIndex = 5;
    }
    if (p.dot(v3) < -lV3) {
        bestIndex = 4;
    }

    if (bestIndex !== -1) {
        position.translateBy(globals.gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }
    return -1;
}




//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const gen0 = new Isometry().makeLeftTranslation(G1);
    const gen1 = new Isometry().makeInvLeftTranslation(G1);
    const gen2 = new Isometry().makeLeftTranslation(G2);
    const gen3 = new Isometry().makeInvLeftTranslation(G2);
    const gen4 = new Isometry().makeLeftTranslation(G3);
    const gen5 = new Isometry().makeInvLeftTranslation(G3);


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



const lightColors = [lightColor1, lightColor2, lightColor3, lightColor4];







export {
    pGenVectors,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix,
    PointLightObject,
    lightColors
};
