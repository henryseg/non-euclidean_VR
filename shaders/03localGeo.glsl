//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/

tangVector add(tangVector v1, tangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir + v2.dir);
}


//this does V1-V2
tangVector sub(tangVector v1, tangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir - v2.dir);
}


tangVector scalarMult(float a, tangVector v) {
    // scalar multiplication of a tangent vector
    return tangVector(v.pos, a * v.dir);
}

/*
tangVector translate(mat4 isom, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(isom * v.pos, isom * v.dir);
}

tangVector applyMatrixToDir(mat4 matrix, tangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return tangVector(v.pos, matrix * v.dir);
}
*/

//CHANGED THIS
//the metric on the tangent space at a point
float tangDot(tangVector u, tangVector v){

    return dot(u.dir,  v.dir);

}

//the norm of a tangent vector using the Riemannian metric
float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

//return unit tangent vector in same direction
tangVector tangNormalize(tangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return tangVector(v.pos, v.dir/tangNorm(v));
}

//give the cosine of the angle between two tangent vectors at a point
float cosAng(tangVector u, tangVector v){
    // cosAng between two vector in the tangent bundle
    //could probably speed things up if we didn't normalize but instead required unit length inputs?
    return tangDot(tangNormalize(u), tangNormalize(v));
}

//reflect the unit tangent vector u off the surface with unit normal nVec
tangVector reflectOff(tangVector u,tangVector nVec){
    return add(scalarMult(-2.0 * tangDot(u, nVec), nVec), u);
}


//MOVED TO END OF GLOBAL GEOEMTRY TO USE TANGDIR FUNCTION
//// return a basis of vectors at the point p
//mat4 tangBasis(vec4 p){
//
//    
//    vec4 basis_x = vec4(1., 0., 0., 0.);
//    vec4 basis_y = vec4(0., 1., 0., 0.);
//    vec4 basis_z = vec4(0., 0., 1., 0.);
//    mat4 theBasis = mat4(0.);
//    theBasis[0]=basis_x;
//    theBasis[1]=basis_y;
//    theBasis[2]=basis_z;
//    return theBasis;
//}
//
//




//----------------------------------------------------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------------------------------------------------

// DOING THINGS WITH LOCAL TANGENT VECTORS
//for some geometries, it is possible to instead work with tangent vectors repp'd as vectors pulled back to the origin
//this works via existence of a simple transitivee subgroup of isometries
//in some cases (Nil, Sol, SL2) this makees compuation much easier!
//below is the analogs of all the methods for tangent vectors, redefined for local tangent vectors

//----------------------------------------------------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------------------------------------------------




////----------------------------------------------------------------------------------------------------------------------
//// LOCAL GEOMETRY
////----------------------------------------------------------------------------------------------------------------------
////the same methods as above, overloaded for working with local tangent vectors when that is preferrable.
//
////Methods perfoming computations in the tangent space at a given point.
//
//
//localTangVector add(localTangVector v1, localTangVector v2) {
//    // add two tangent vector at the same point
//    // TODO : check if the underlyig point are indeed the same ?
//    return localTangVector(v1.pos, v1.dir + v2.dir);
//}
//
//localTangVector sub(localTangVector v1, localTangVector v2) {
//    // subtract two tangent vector at the same point
//    // TODO : check if the underlyig point are indeed the same ?
//    return localTangVector(v1.pos, v1.dir - v2.dir);
//}
//
//localTangVector scalarMult(float a, localTangVector v) {
//    // scalar multiplication of a tangent vector
//    return localTangVector(v.pos, a * v.dir);
//}
//
//float tangDot(localTangVector u, localTangVector v){
//    return dot(u.dir.xyz, v.dir.xyz);
//
//}
//
//float tangNorm(localTangVector v){
//    // calculate the length of a tangent vector
//    return sqrt(tangDot(v, v));
//}
//
//localTangVector tangNormalize(localTangVector v){
//    // create a unit tangent vector (in the tangle bundle)
//    return localTangVector(v.pos, v.dir/tangNorm(v));
//}
//
//float cosAng(localTangVector u, localTangVector v){
//    // cosAng between two vector in the tangent bundle
//    return tangDot(tangNormalize(u), tangNormalize(v));
//}
//
//
//
//
//
//
//
//
//
//
////----------------------------------------------------------------------------------------------------------------------
//// CONVERSION BETWEEN TANGVECTOR AND LOCALTANGVECTOR
////----------------------------------------------------------------------------------------------------------------------
//
//localTangVector toLocalTangVector(tangVector v) {
//    Isometry isom = makeInvLeftTranslation(v.pos);
//    localTangVector res = localTangVector(v.pos, translate(isom, v.dir));
//    return tangNormalize(res);
//}
//
//tangVector toTangVector(localTangVector v) {
//    Isometry isom = makeLeftTranslation(v.pos);
//    tangVector res = tangVector(v.pos, translate(isom, v.dir));
//    return tangNormalize(res);
//}
//


