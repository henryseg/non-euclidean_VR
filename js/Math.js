import {
    Vector3,
    Vector4,
    Matrix4
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


//CHANGED THIS
function projPoint(pt) {
    //euclidean space is affine; is its own model
    return new Vector3(pt.x / pt.w, pt.y / pt.w, pt.z / pt.w);
}









//----------------------------------------------------------------------------------------------------------------------
//	Geometry Constants & Lattice Vectors in Tangent Space
//----------------------------------------------------------------------------------------------------------------------
let PI = 3.14159265;
//CHANGED THIS
let halfWidth = PI / 4.;
let projHalfWidth = 1.;


//CHANGED THIS
function setGenVec(t) {

    let G1 = new Vector4(2. * halfWidth, 0, 0., 0.);
    let G2 = new Vector4(0, 2. * halfWidth, 0., 0.);
    let G3 = new Vector4(0., 0., 2. * halfWidth, 0.);
    return [G1, G2, G3]
}



function createProjGenerators(t) {

    let Generators = setGenVec(t);

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

    //create a list of these vectors
    let pVs = [pV1, pV2, pV3];

    //also need a list of the unit normal vectors to each face of the fundamental domain.
    //Assume a positively oriented list of basis vectors, so that the normal done in order always points "inward"
    const nV1 = pV2.clone().cross(pV3).normalize();
    const nV2 = pV3.clone().cross(pV1).normalize();
    const nV3 = pV1.clone().cross(pV2).normalize();

    let nVs = [nV1, nV2, nV3];

    //return the side pairings in the affine model, and the unit normals to the faces of the fundamental domain in that model
    return [pVs, nVs];

}




//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------



//CHANGED THIS
function createGenerators(t) { /// generators for the tiling by cubes.

    let GenVec = setGenVec(t);

    const gen0 = new Isometry().makeLeftTranslation(GenVec[0]);
    const gen1 = new Isometry().makeInvLeftTranslation(GenVec[0]);
    const gen2 = new Isometry().makeLeftTranslation(GenVec[1]);
    const gen3 = new Isometry().makeInvLeftTranslation(GenVec[1]);
    const gen4 = new Isometry().makeLeftTranslation(GenVec[2]);
    const gen5 = new Isometry().makeInvLeftTranslation(GenVec[2]);

    gen0.multiply(new Isometry().set([new Matrix4().makeRotationX(-PI / 2).transpose()]));

    gen1.multiply(new Isometry().set([new Matrix4().makeRotationX(PI / 2).transpose()]));

    gen2.multiply(new Isometry().set([new Matrix4().makeRotationY(-PI / 2).transpose()]));

    gen3.multiply(new Isometry().set([new Matrix4().makeRotationY(PI / 2).transpose()]));

    gen4.multiply(new Isometry().set([new Matrix4().makeRotationZ(-PI / 2).transpose()]));

    gen5.multiply(new Isometry().set([new Matrix4().makeRotationZ(PI / 2).transpose()]));

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

//below, nVi is the normal vector to the faces paired by the ith generator: which has translation (in the affine model) pVi
//p.nV1 evals the linear functional measuring distance from the plane on p
//then, we compare this distance to the output of pV1 measured the same way (the translation vectgor)
//when our measured distane becomes greater, that means we are past the face of the fundamental domain determined by pV1, so we're outside

function fixOutsideCentralCell(position) {
    let bestIndex = -1;
    //the vector in the geometry corresponding to our position
    let q = ORIGIN.clone().applyMatrix4(position.boost.matrix);

    //now project this into the projective model
    let p = projPoint(q);

    //give names to the globals we need
    let pV = globals.projGens[0];
    let nV = globals.projGens[1];


    if (p.dot(nV[0]) > pV[0].dot(nV[0])) {
        bestIndex = 1;
    }
    if (p.dot(nV[0]) < -pV[0].dot(nV[0])) {
        bestIndex = 0;
    }
    if (p.dot(nV[1]) > pV[1].dot(nV[1])) {
        bestIndex = 3;
    }
    if (p.dot(nV[1]) < -pV[1].dot(nV[1])) {
        bestIndex = 2;
    }

    if (p.dot(nV[2]) > pV[2].dot(nV[2])) {
        bestIndex = 5;
    }
    if (p.dot(nV[2]) < -pV[2].dot(nV[2])) {
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









export {
    setGenVec,
    createProjGenerators,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix
};
