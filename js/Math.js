import {
    Vector3,
    Vector4,
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
    return new Vector3(pt.x, pt.y, pt.z);
}









//----------------------------------------------------------------------------------------------------------------------
//	Geometry Constants & Lattice Vectors in Tangent Space
//----------------------------------------------------------------------------------------------------------------------


//turn this into functions which take in lattice generators (described via their vectors for a translateByVector approach)
//and output the corresponding isometries, and vectors used in the projective model for fixOutsideCentralCell



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
const pV1 = projPoint(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V1)));
const pV2 = projPoint(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V2)));
const pV3 = projPoint(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V3)));

//the lengths and directions of these vectors are important quantities for writing the teleport-back-to-central-cell commands
const lV1 = pV1.length();
const lV2 = pV2.length();
const lV3 = pV3.length();

//create a list of these vectors
let pVs = [pV1, pV2, pV3];

//the unit vectors in these directions
const uV1 = pV1.normalize();
const uV2 = pV2.normalize();
const uV3 = pV3.normalize();


//this is the actual data the shader needs each compute cycle
let lVs = [lV1, lV2, lV3];
let uVs = [uV1, uV2, uV3];


//also need a list of the unit normal vectors to each face of the fundamental domain.
//Assume a positively oriented list of basis vectors, so that the normal done in order always points "inward"
const nV1 = pV2.cross(pV3).normalize();
const nV2 = pV3.cross(pV1).normalize();
const nV3 = pV1.cross(pV2).normalize();

let nVs = [nV1, nV2, nV3];







//----------------------------------------------------------------------------------------------------------------------
//	Build a function that does this so we can vary our basis vectors in real time
//----------------------------------------------------------------------------------------------------------------------


//
//
//
////From this define a function which produces the vectors which point at the faces of the fundamental domain in the affine model
////this is a computationally easy way to deal with teleporting back to the fundamental domain
//
//function projModelGens(Generators) {
//
//    //the vectors of half the length determine transformations taking the origin to the faces of the fundamental domain
//    let V0 = Generators[0].clone().multiplyScalar(0.5);
//    let V1 = Generators[1].clone().multiplyScalar(0.5);
//    let V2 = Generators[2].clone().multiplyScalar(0.5);
//
//    //what we actually need is the image of these in the projective models, as this tells us where the faces of the fundamental domains are
//
//    //The three vectors specifying the directions / lengths of the generators of the lattice  IN THE PROJECTIVE MODEL
//    //length of each vector is the HALF LENGTH of the generator: its the length needed to go from the center to the face
//    let pV0 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V1)));
//    let pV1 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V2)));
//    let pV2 = projDirection(ORIGIN.clone().translateBy(new Isometry().makeLeftTranslation(V3)));
//
//    //create a list of these vectors
//    let pV = [pV0, pV1, pV2];
//
//    return pV;
//}
//
//
//
////get the lengths of these vectors
//function projModelLens(Generators) {
//
//    let pV = projModelGens(Generators);
//
//    let lV0 = pV[0].length();
//    let lV1 = pV[1].length();
//    let lV2 = pV[2].length();
//
//    return [lV0, lV1, lV2];
//
//}
//
//
////get the unit vectors in these directions
//function projModelDirs(Generators) {
//
//    let pV = projModelGens(Generators);
//
//    let lV0 = pV[0].normalize();
//    let lV1 = pV[1].normalize();
//    let lV2 = pV[2].normalize();
//
//    return [lV0, lV1, lV2];
//
//
//}
//
//






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
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------


//Assumption; in the affine model of the geometry, the fundamental domain is cut out by affine hyperplanes.
//thus, we can use linear algebra to determine where we are relative the walls.
//if the vectors are orthogonal, every face (span of two vectors) has a normal vector, and that normal vector IS the remaining vector
//so, taking the dot product with this vector is the SAME THING as evaluating the linear functional whose kernel is the plane spanned by the other two.
//in case of a non-orthogonal situation, this no longer holds.
//instead, for each pair of vectors (spanning a face of the parallelpiped), we find their normal vector: this has their span as the kernel
//then we take dot products agains this.  If the dot prod exceeds the dot prod of the remaining vector with this one, then we are outside the cell, and use that remaining generator to return.



//this works fine when the vectors are orthogonal (the std case we care about!)
//so, the modification below isn't needed in practice right now
//but - its needed for a thing I'm (Steve) trying to do with Edmund 


function fixOutsideCentralCell(position) {
    let bestIndex = -1;
    //the vector in the geometry corresponding to our position
    let q = ORIGIN.clone().applyMatrix4(position.boost.matrix);

    //now project this into the projective model
    let p = projPoint(q);


        if (p.dot(uV1) > lV1) {
            bestIndex = 1;
        }
        if (p.dot(uV1) < -lV1) {
            bestIndex = 0;
        }
        if (p.dot(uV2) > lV2) {
            bestIndex = 3;
        }
        if (p.dot(uV2) < -lV2) {
            bestIndex = 2;
        }

        if (p.dot(uV3) > lV3) {
            bestIndex = 5;
        }
        if (p.dot(uV3) < -lV3) {
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






//function fixOutsideCentralCell(position) {
//    let bestIndex = -1;
//    //the vector in the geometry corresponding to our position
//    let q = ORIGIN.clone().applyMatrix4(position.boost.matrix);
//
//    //now project this into the projective model (a vector in R3)
//    let p = projPoint(q);
//
//    //now, take the normal vectors to the faces, and compare the dot prod of the point p with the remaining basis vector
//
//
//    if (p.dot(nV1) > Math.abs(pV1.dot(nV1))) {
//        bestIndex = 1;
//    }
//    if (p.dot(nV1) < -Math.abs(pV1.dot(nV1))) {
//        bestIndex = 0;
//    }
//    if (p.dot(nV2) > Math.abs(pV2.dot(nV2))) {
//        bestIndex = 3;
//    }
//    if (p.dot(nV2) < -Math.abs(pV2.dot(nV2))) {
//        bestIndex = 2;
//    }
//
//    if (p.dot(nV3) > Math.abs(pV3.dot(nV3))) {
//        bestIndex = 5;
//    }
//    if (p.dot(nV3) < -Math.abs(pV3.dot(nV3))) {
//        bestIndex = 4;
//    }
//
//    if (bestIndex !== -1) {
//        position.translateBy(globals.gens[bestIndex]);
//        return bestIndex;
//    } else {
//        return -1;
//    }
//    return -1;
//}







export {
    pVs,
    nVs,
    lVs,
    uVs,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix
};
