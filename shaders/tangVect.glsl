

//----------------------------------------------------------------------------------------------------------------------
// STRUCT tangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating points in the tangent bundle
  A tangVector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Implement various basic methods to manipulate them
*/

struct tangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------

Isometry makeLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}


Isometry makeInvLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}


tangVector translate(Isometry A, tangVector v) {
    // over load to translate a direction
    return tangVector(A.matrix * v.pos, A.matrix * v.dir);
}


tangVector rotateFacing(mat4 A, tangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(v.pos, A*v.dir);
}


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


float tangDot(tangVector u, tangVector v){
    mat3 g = mat3(
    exp(-2. * u.pos.z), 0., 0.,
    0., exp(2. * u.pos.z), 0.,
    0., 0., 1.
    );
    return dot(u.dir.xyz, g * v.dir.xyz);

}


float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}


tangVector tangNormalize(tangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return tangVector(v.pos, v.dir/tangNorm(v));
}


float cosAng(tangVector u, tangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}



mat4 tangBasis(vec4 p){
    // return a basis of vectors at the point p

    vec4 basis_x = vec4(1., 0., 0., 0.);
    vec4 basis_y = vec4(0., 1., 0., 0.);
    vec4 basis_z = vec4(0., 0., 1., 0.);
    mat4 theBasis = mat4(0.);
    theBasis[0]=basis_x;
    theBasis[1]=basis_y;
    theBasis[2]=basis_z;
    return theBasis;
}

//mat4 tangBasis(vec4 p){
//
//    return makeLeftTranslation(p).matrix;
//}



void init_ellip(tangVector u) {
    // initializes all the parameters needed to march along the geodesic directed by u
    // we assume that the position of u is the origin
    // if ab = 0 (hyperbolic sheets), all the parameters are not needed,
    // however their computations are trivial
    // (all the elliptic integrals becomes, trivial, the AGM stops where it starts, etc)
    // instead of adding cases, we simply run the computations

    // some renaming to simplify the formulas
    // by assumption a^2 + b^2 + c^2 = 1
    float ab = abs(u.dir.x * u.dir.y);

    // some auxiliary value to avoind redundant computations of roots.
    float aux1 = sqrt(1. - 2. * ab);
    float aux2 = 2. * sqrt(ab);

    // frequency
    ell_mu = sqrt(1. + 2. * ab);

    // parameters of the elliptic functions
    ell_k = aux1 / ell_mu;
    ell_kprime = aux2 / ell_mu;
    ell_m = (1. - 2. * ab) / (1. + 2. * ab);

    // complete elliptic integrals and related quantities
    agm();
    vec2 KE = ellipke();
    ell_K = KE.x;
    ell_E = KE.y;

    // if ab = 0 (hyperbolic sheets) then k' = 0, in which case, L will not be needed and makes no sense here
    if (ab != 0.) {
        ell_L = ell_E / (ell_kprime * ell_K) - 0.5 * ell_kprime;
    }

}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT localTangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Another data type for manipulating points in the tangent bundler
  A localTangVector is given by
  - pos : a point in the space
  - dir: the pull back of the tangent vector by the (unique) element of Sol bringing pos to the origin

  This sould reduce numerical errors.

  Implement various basic methods to manipulate them
*/

struct localTangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// pulled back tangent vector
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------

Isometry makeLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}


Isometry makeInvLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}


localTangVector translate(Isometry A, localTangVector v) {
    // over load to translate a direction
    // WARNING. Only works if A is an element of SOL.
    // Any more general isometry should also acts on the direction component
    return localTangVector(A.matrix * v.pos, v.dir);
}


localTangVector rotateFacing(mat4 A, localTangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return localTangVector(v.pos, A*v.dir);
}


//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/

localTangVector add(localTangVector v1, localTangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir + v2.dir);
}

localTangVector sub(localTangVector v1, localTangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir - v2.dir);
}

localTangVector scalarMult(float a, localTangVector v) {
    // scalar multiplication of a tangent vector
    return localTangVector(v.pos, a * v.dir);
}

float tangDot(localTangVector u, localTangVector v){
    return dot(u.dir.xyz, v.dir.xyz);

}

float tangNorm(localTangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

localTangVector tangNormalize(localTangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return localTangVector(v.pos, v.dir/tangNorm(v));
}

float cosAng(localTangVector u, localTangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}


//----------------------------------------------------------------------------------------------------------------------
// CONVERSION BETWEEN TANGVECTOR AND LOCALTANGVECTOR
//----------------------------------------------------------------------------------------------------------------------

localTangVector toLocalTangVector(tangVector v) {
    Isometry isom = makeInvLeftTranslation(v.pos);
    localTangVector res = localTangVector(v.pos, translate(isom, v.dir));
    return tangNormalize(res);
}

tangVector toTangVector(localTangVector v) {
    Isometry isom = makeLeftTranslation(v.pos);
    tangVector res = tangVector(v.pos, translate(isom, v.dir));
    return tangNormalize(res);
}
