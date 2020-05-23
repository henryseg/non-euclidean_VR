#version 300 es
out vec4 out_FragColor;


//----------------------------------------------------------------------------------------------------------------------
// PARAMETERS
//----------------------------------------------------------------------------------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

//determine what we draw: ball and lights,
const bool GLOBAL_SCENE=true;
const bool TILING_SCENE=false;
const bool EARTH=false;

//const bool TILING=false;
//const bool PLANES=false;

//bool DRAGON=!(TILING||PLANES);
//bool DRAGON_PLANE=not(TILING||PLANES);


const bool FAKE_LIGHT_FALLOFF=true;
const bool FAKE_LIGHT = true;
const bool FAKE_DIST_SPHERE = false;

//const float globalObjectRadius = 0.4;
const float centerSphereRadius =0.67;
const float vertexSphereSize = 0.23;//In this case its a horosphere
const float modelHalfCube = 0.5;

//----------------------------------------------------------------------------------------------------------------------
// "TRUE" CONSTANTS
//----------------------------------------------------------------------------------------------------------------------

const float PI = 3.1415926538;
const float sqrt3 = 1.7320508075688772;
const float sqrt2 = 1.4142135623730951;

const vec4 ORIGIN = vec4(0, 0, 1, 0);

vec3 debugColor = vec3(0.5, 0, 0.8);

//----------------------------------------------------------------------------------------------------------------------
// Global Constants
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;


void setResolution(int UIVar){
    if (UIVar==1){
        MAX_MARCHING_STEPS =  50;
        MAX_DIST = 100.0;
    }
    if (UIVar==2){
        MAX_MARCHING_STEPS =  200;
        MAX_DIST = 500.0;

    }
    if (UIVar==3){
        MAX_MARCHING_STEPS =  500;
        MAX_DIST = 1000.0;

    }
}

const float EPSILON = 0.0001;
const float fov = 90.0;

//----------------------------------------------------------------------------------------------------------------------
// Some global variables
//----------------------------------------------------------------------------------------------------------------------

int hitWhich = 0;

//----------------------------------------------------------------------------------------------------------------------
// Auxiliary methods: computations in SL(2,R) and X
//----------------------------------------------------------------------------------------------------------------------

/*

The elements of SL(2,R) seen as vectors in the basis E = (E0,E1,E2,E3)
See Jupyter Notebook
The elements satisfy the relation - x^2 - y^2 + z^2 + w^2 = -1

*/

// Correct the error to make sure that the point lies on the "hyperboloid"
vec4 SLreduceError(vec4 elt) {
    float q = - elt.x * elt.x - elt.y * elt.y + elt.z * elt.z + elt.w * elt.w;
    return elt / sqrt(-q);
}

// Projection from SL(2,R) to SO(2,1)
mat3 SLtoMatrix3(vec4 elt){
    mat4 aux1 = mat4(
    elt.x, elt.y, elt.z, 0.,
    -elt.y, elt.x, elt.w, 0.,
    elt.z, elt.w, elt.x, 0.,
    -elt.w, elt.z, elt.y, 0.
    );
    mat4 aux2 = mat4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y,
    0., 0., 0., 0.
    );
    mat3 res = mat3(aux1 * aux2);
    return res;
}

// Projection onto H^2
vec3 SLtoH2(vec4 elt) {
    mat3 m = SLtoMatrix3(elt);
    vec3 res = vec3(0., 0., 1.);
    return m * res;
}

// Return the 4x4 Matrix, corresponding to the current element, seen as an isometry of SL(2,R)
mat4 SLtoMatrix4(vec4 elt) {
    mat4 res = mat4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y,
    elt.w, -elt.z, -elt.y, elt.x
    );
    return res;
}

// Multiply two elements of SL2 in the following order: elt1 * elt2
vec4 SLmultiply(vec4 elt1, vec4 elt2) {
    mat4 L1 = SLtoMatrix4(elt1);
    return SLreduceError(L1 * elt2);
}

// Translate the element by the given angle along the fiber
vec4 SLtranslateFiberBy(vec4 elt, float angle) {
    float aux = 0.5 * angle;
    mat4 t = mat4(
    cos(aux), sin(aux), 0., 0.,
    -sin(aux), cos(aux), 0., 0.,
    0., 0., cos(aux), -sin(aux),
    0., 0., sin(aux), cos(aux)
    );
    return SLreduceError(t * elt);
}

/*

A point in the universal cover X of SL(2,R) is a vector (x,y,z,w) where
- (x,y,z) is its projection onto H^2
- w is the angle in the fiber component

The points of H^2 are meant in the hyperboloid model, i.e. x^2 + y^2 - z^2 = -1 and z > 0.
The origin is (0,0,1,0)

*/

// Correct the point so that the H^2 component stays on the hyperboloid.
vec4 XreduceError(vec4 point) {
    float q = point.x * point.x + point.y * point.y - point.z * point.z;
    return vec4(point.xyz / sqrt(-q), point.w);
}

// Apply to the H^2 component a rotation of angle alpha centered at the origin
// TODO. Check if it is really needed (maybe we only need the tangVector form of it)
vec4 XrotateBy(vec4 point, float angle) {
    mat4 rot = mat4(
    cos(angle), sin(angle), 0., 0.,
    -sin(angle), cos(angle), 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., 1.
    );
    return rot * point;
}

// Apply the flip (x,y,z,w) -> (y,x,z,-w) to the current point
// TODO. Check if it is really needed (maybe we only need the tangVector form of it)
vec4 Xflip(vec4 point, float angle) {
    mat4 flip = mat4(
    0., 1., 0., 0.,
    1., 0., 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., -1.
    );
    return flip * point;
}

// Covering map from X to SL(2,R)
vec4 XtoSL2(vec4 point) {
    vec4 res = vec4(
    sqrt(0.5 * point.z + 0.5),
    0.,
    point.x / sqrt(2. * point.z + 2.),
    point.y / sqrt(2. * point.z + 2.)
    );
    res = SLtranslateFiberBy(res, point.w);
    return res;
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT isometry
//----------------------------------------------------------------------------------------------------------------------

/*

  Data type for manipulating isometries of the space
  In this geometry we only consider as isometries the element of X acting on itself on the left.
  An isometry is represented by the image of the origin, coded as a vec4
*/

struct Isometry {
    vec4 target;// the image of the origin
};

// Method to unserialized isometries passed to the shader
Isometry unserialize(vec4 data) {
    return Isometry(data);
}

// Product of two isometries (more precisely isom1 * isom2)
Isometry composeIsometry(Isometry isom1, Isometry isom2) {
    vec4 aux1 = XtoSL2(isom1.target);
    vec4 aux2 = XtoSL2(isom2.target);

    vec4 aux = SLmultiply(aux1, aux2);
    aux = SLtranslateFiberBy(aux, -isom1.target.w - isom2.target.w);
    vec3 h2Point = SLtoH2(aux);

    return Isometry(vec4(
    h2Point,
    isom1.target.w + isom2.target.w + 2. * atan(aux.y, aux.x)
    ));
}

// Return the inverse of the given isometry
Isometry getInverse(Isometry isom) {
    float angle = PI - isom.target.w;

    mat3 rot = mat3(
    cos(angle), sin(angle), 0.,
    -sin(angle), cos(angle), 0.,
    0., 0., 1.
    );

    vec4 targetInv = vec4(
    rot * isom.target.yxz,
    -isom.target.w
    );
    targetInv = XreduceError(targetInv);
    return Isometry(targetInv);
}

// Return the isometry sending the origin to p
Isometry makeLeftTranslation(vec4 p) {
    return Isometry(p);
}
// Return the isometry sending p to the origin
Isometry makeInvLeftTranslation(vec4 p) {
    return getInverse(makeLeftTranslation(p));
}

// Translate a point by the given isometry
vec4 translate(Isometry isom, vec4 p) {
    Isometry aux = makeLeftTranslation(p);
    aux = composeIsometry(isom, aux);
    return aux.target;
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT tangVector
//----------------------------------------------------------------------------------------------------------------------


/*
  Data type for manipulating points in the tangent bundle
  A tangVector is given by
  - pos : a point in the space
  - global_dir: a tangent vector at pos
  - local_dir: the pull back of the tangent vector at the origin
  - global: a flag to say if the global direction has been computed
  - local: a flag to say if the local direction has been computed

  Implement various basic methods to manipulate them

*/


struct tangVector {
    vec4 pos;// position on the manifold
    vec4 global_dir;// vector in the tangent space at the point pos
    vec4 local_dir;// pull back of the tangent vector at the origin
    bool global;// true if the global dir has been computed, false otherwise
    bool local;// true if the local dir has been computed, false otherwise
};


// Constructor from global data
tangVector initFromGlobal(vec4 pos, vec4 dir) {
    return tangVector(pos, dir, vec4(0.), true, false);
}

// Constructor from local data
tangVector initFromLocal(vec4 pos, vec4 dir) {
    return tangVector(pos, vec4(0.), dir, false, true);
}

// Not all geometries have peferred subgroup of isometries that can be used to pull back tangent vectors
// Hence the default constructor use the global direction
// This consructor should be used for every geometry independant part of the code
tangVector newTangVector(vec4 pos, vec4 dir) {
    return initFromGlobal(pos, dir);
}

// return a copy of the vector
tangVector clone(tangVector v) {
    return tangVector(v.pos, v.global_dir, v.local_dir, v.global, v.local);
}


//----------------------------------------------------------------------------------------------------------------------
// Conversion between global and local representations of tangent vectors
//----------------------------------------------------------------------------------------------------------------------

/*

The methods below compute (if needed) the global/local direction of the given tangent vector
The tangent vector is passed as a reference, hence it is altered by the function

*/

// Return the differential of the isometry sending the origin to target
mat4 diffTranslation(vec4 target) {
    float x = target.x;
    float y = target.y;
    float z = target.z;
    float w = target.w;
    float aux1 = x * cos(w) + y * sin(w);
    float aux2 = y * cos(w) - x * sin(w);

    // differential map of the translation from the origin to pos
    mat4 m = mat4(
    x * aux1 / (z + 1.) + cos(w), y * aux1 / (z + 1.) + sin(w), aux1, aux2 / (z + 1.),
    x * aux2 / (z + 1.) - sin(w), y * aux2 / (z + 1.) + cos(w), aux2, -aux1 / (z + 1.),
    0.5 * x, 0.5 * y, 0.5 * z + 0.5, 0.,
    0., 0., 0., 1.
    );

    return m;
}

// Return the inverse of the differential of the isometry sending the origin to target
mat4 diffInvTranslation(vec4 target) {
    float x = target.x;
    float y = target.y;
    float z = target.z;
    float w = target.w;
    float aux1 = x * cos(w) + y * sin(w);
    float aux2 = y * cos(w) - x * sin(w);

    // inverse of the differential map of the translation from the origin to pos
    mat4 m = mat4(
    cos(w), -sin(w), -2. * x / (z + 1.), - y / (z + 1.),
    sin(w), cos(w), -2. * y / (z + 1.), x / (z + 1.),
    - aux1 / (z + 1.), -aux2 / (z + 1.), 2. * z / (z + 1.), 0.,
    0., 0., 0., 1.
    );

    return m;
}

// set up (if needed) the local direction from the global one
void setLocalDir(inout tangVector v) {
    if (!v.local) {
        // inverse of the differential map of the translation from the origin to pos
        mat4 m = diffInvTranslation(v.pos);
        // update the local direction
        v.local_dir = m * v.global_dir;
        // update the flag
        v.local = true;
    }
}

// set up (if needed) the global direction from the local one
void setGlobalDir(inout tangVector v) {
    if (!v.global) {
        // differential map of the translation from the origin to pos
        mat4 m = diffTranslation(v.pos);
        // update the global direction
        v.global_dir = m * v.local_dir;
        // update the flag
        v.global = true;
    }
}


// reset the flag of the local direction
// the next time the local direction is needed it will have to be recomputed
void resetLocalDir(inout tangVector v) {
    v.local = false;
}

// reset the flag of the global direction
// the next time the global direction is needed it will have to be recomputed
void resetGlobalDir(inout tangVector v) {
    v.global = false;
}

// make sure that the two given vectors have at least one representation (local or global) in common
// if there is no common representation, we update the vectors to have a common representation
// the type of representation is given by the value of rep:
// - O : local representation
// - 1 : global representation
void prepareDir(inout tangVector v1, inout tangVector v2, int rep){
    bool local = v1.local && v2.local;
    bool global = v1.global && v2.global;
    switch (rep){
        case 0:
        setLocalDir(v1);
        setLocalDir(v2);
        break;
        case 1:
        setGlobalDir(v1);
        setGlobalDir(v2);
        break;
    }
}

// overload of the previous method
// the set pref to 0 by default
void prepareDir(inout tangVector v1, inout tangVector v2){
    prepareDir(v1, v2, 0);
}

//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------


// overlaod using tangVector
Isometry makeLeftTranslation(tangVector v) {
    return makeLeftTranslation(v.pos);
}

// overlaod using tangVector
Isometry makeInvLeftTranslation(tangVector v) {
    return makeInvLeftTranslation(v.pos);
}

// overload to translate a direction
void translate(Isometry isom, inout tangVector v) {
    // if the vector is given by a global direction, we switch to a local direction
    // we are lazy and do not update the global direction yet,
    // it will be done later if needed.
    if (v.global) {
        setLocalDir(v);
        resetGlobalDir(v);
    }
    // translate the position
    v.pos = translate(isom, v.pos);
}


// rotate the tangent vector (position and direction around the fiber by an angle alpha)
void rotateBy(float angle, inout tangVector v) {
    // Rotation acts only on the H^2 part
    // Because of our choice of representation this action is encoded by a linear map on R^4.
    // The good news is that it suffices to apply the same matrix to all the properties
    // (position, local direction, global direction)
    mat4 rot = mat4(
    cos(angle), sin(angle), 0., 0.,
    -sin(angle), cos(angle), 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., 1.
    );

    v.pos = rot * v.pos;
    if (v.local) {
        v.local_dir = rot * v.local_dir;
    }
    if (v.global) {
        v.global_dir = rot * v.global_dir;
    }
}

// flip the tangent vector (see Jupyter Notebook)
void flip(inout tangVector v) {
    // As for the rotation, the flip is encoded by a linear map on R^4.
    // The good news is that it suffices to apply the same matrix to all the properties
    // (position, local direction, global direction)
    mat4 flip = mat4(
    0., 1., 0., 0.,
    1., 0., 0., 0.,
    0., 0., 1., 0.,
    0., 0., 0., -1.
    );

    v.pos = flip * v.pos;
    if (v.local) {
        v.local_dir = flip * v.local_dir;
    }
    if (v.global) {
        v.global_dir = flip * v.global_dir;
    }
}


// apply a local rotation of the direction
void rotateByFacing(mat4 A, inout tangVector v){
    // if the vector is given by a global direction, we switch to a local direction
    // we are lazy and do not update the global direction yet,
    // it will be done later if needed.
    if (v.global) {
        setLocalDir(v);
        resetGlobalDir(v);
    }
    v.local_dir = A * v.local_dir;
}


//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/


// Add two tangent vector at the same point (return v1 + v2)
tangVector add(tangVector v1, tangVector v2) {
    // TODO : check if the underlyig point are indeed the same ?
    // properties of the result that we are going to update
    bool global = false;
    bool local = false;
    vec4 global_dir = vec4(0.);
    vec4 local_dir = vec4(0.);


    // Make sure that the two vectors have at least one representation (local or global) in common.
    prepareDir(v1, v2);
    // Add the directions (if the representations agree)
    if (v1.local && v2.global) {
        local = true;
        local_dir = v1.local_dir + v2.local_dir;
    }
    if (v1.global && v2.global) {
        global = true;
        global_dir = v1.global_dir + v2.global_dir;
    }
    // return the added vectors
    return tangVector(v1.pos, global_dir, local_dir, global, local);
}

// subtract two tangent vector at the same point (return v1 - v2)
tangVector sub(tangVector v1, tangVector v2) {
    // TODO : check if the underlyig point are indeed the same ?
    // properties of the result that we are going to update
    bool global = false;
    bool local = false;
    vec4 global_dir = vec4(0.);
    vec4 local_dir = vec4(0.);


    // Make sure that the two vectors have at least one representation (local or global) in common.
    prepareDir(v1, v2);
    // Add the directions (if the representations agree)
    if (v1.local && v2.global) {
        local = true;
        local_dir = v1.local_dir - v2.local_dir;
    }
    if (v1.global && v2.global) {
        global = true;
        global_dir = v1.global_dir - v2.global_dir;
    }
    // return the added vectors
    return tangVector(v1.pos, global_dir, local_dir, global, local);
}

// scalar multiplication of a tangent vector (return a * v)
tangVector scalarMult(float a, tangVector v) {
    return tangVector(v.pos, a * v.global_dir, a * v.local_dir, v.global, v.local);
}


// dot product of the two vectors
float tangDot(tangVector v1, tangVector v2){
    // Make sure that the two vectors have at least one representation (local or global) in common.
    prepareDir(v1, v2);
    if (v1.local && v2.local) {
        // the tensor metric at the origin is given by the identity matrix
        return dot(v1.local_dir, v1.local_dir);
    }
    if (v1.global && v2.global) {
        // build the tensor metric at the point v1.pos = v2.pos
        float x = v1.pos.x;
        float y = v1.pos.y;
        float z = v1.pos.z;
        mat4 g = mat4(
        1. + pow(y / (z + 1.), 2.), - x * y / pow(z + 1., 2.), -x / (z + 1.), -y / (z + 1.),
        - x * y / pow(z + 1., 2.), 1. + pow(x / (z + 1.), 2.), -y / (z + 1.), x / (z + 1.),
        -x / (z + 1.), -y / (z + 1.), (z - 1.) / (z + 1.), 0.,
        -y / (z + 1.), x / (z + 1.), 0., 1.
        );
        // compute the norm of the vector
        return dot(v1.global_dir, g * v2.global_dir);
    }
    // this point of the code should never be reached
    // because we prepared the vectors at the beginning.
    return -1.;
}

// calculate the length of a tangent vector
float tangNorm(tangVector v){
    return sqrt(tangDot(v, v));
}

// create a unit tangent vector (in the tangle bundle)
// when possible use the normalization method below
tangVector tangNormalize(tangVector v){
    // properties of the result that we are going to update
    bool global = false;
    bool local = false;
    vec4 global_dir = vec4(0.);
    vec4 local_dir = vec4(0.);

    // length of the vector
    float length = tangNorm(v);

    // scale the direction for each representation
    if (v.local) {
        local = true;
        local_dir = v.local_dir / length;
    }
    if (v.global) {
        global = true;
        global_dir = v.global_dir / length;
    }
    return tangVector(v.pos, global_dir, local_dir, global, local);
}

// normalize the given vector
// normalize is a protected name
void unit(inout tangVector v) {
    // length of the vector
    float length = tangNorm(v);
    // scale the direction for each representation
    if (v.local) {
        v.local_dir = v.local_dir / length;
    }
    if (v.global) {
        v.global_dir = v.global_dir / length;
    }
}


// cosAng between two vector in the tangent bundle
float cosAng(tangVector v1, tangVector v2){
    return tangDot(v1, v2);
}


// return the global direction of a basis of the tangent space at the point p
// given a tangent vector (ux, uy, uz, uw) at (x, y, z, w) it satisfies
//  x * ux + y * uy - z * uz = 0 (because of the hyperboloid model of H^2)
mat4 tangBasis(vec4 p){
    vec4 basis_x = vec4(1., 0., p.x/p.z, 0.);
    vec4 basis_y = vec4(0., 1., p.y/p.z, 0.);
    vec4 basis_z = vec4(0., 0., 0., 1.);
    mat4 theBasis = mat4(0.);
    theBasis[0]=basis_x;
    theBasis[1]=basis_y;
    theBasis[2]=basis_z;
    return theBasis;
}


//----------------------------------------------------------------------------------------------------------------------
// GLOBAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods computing ``global'' objects
*/

// fake distance between two points
float fakeDistance(vec4 p1, vec4 p2){
    return length(p2-p1);
}

// overload of the previous function in case we work with tangent vectors
float fakeDistance(tangVector v1, tangVector v2){
    return fakeDistance(v1.pos, v2.pos);
}

// distance between two points
float exactDist(vec4 p1, vec4 p2) {
    return fakeDistance(p1, p2);
}

// overload of the previous function in case we work with tangent vectors
float exactDist(tangVector v1, tangVector v2){
    return exactDist(v1.pos, v2.pos);
}


// return the tangent vector at p point to q
tangVector tangDirection(vec4 p, vec4 q){
    tangVector res = newTangVector(p, q-p);
    unit(res);
    return res;
}

// overload of the previous function in case we work with tangent vectors
tangVector tangDirection(tangVector u, tangVector v){
    return tangDirection(u.pos, v.pos);
}


// flow the given vector during time t
void flow(float t, inout tangVector v) {
    // set up the local direction if needed
    setLocalDir(v);
    resetGlobalDir(v);



    // prepation : set the vector into an easier form to flow

    // isometry sending the origin the the position of v
    Isometry isom = makeLeftTranslation(v);
    // pull back the tangent vector a the origin (very easy in the local representation)
    v.pos = ORIGIN;
    // flip if needed to get a positive fiber direction
    bool flipped = false;
    if (v.local_dir.w < 0.) {
        flipped = true;
        flip(v);
    }

    // rotation
    // the angle alpha is characterized as follows
    // if u is a tangent vector of the form (a, 0, 0, c) with a, c >= 0
    // then v is obtained from u by a rotation of angle alpha
    float alpha = atan(v.local_dir.y, v.local_dir.x);
    float c = v.local_dir.w;
    float a = sqrt(1. - c * c);

    v.local_dir = vec4(a, 0., 0., c);


    float phi = c * t;// the angle in the fiber achieved by the geodesic (before final adjustment)
    float omega = 0.;// the "pulsatance" involved in the geodesic flow.

    // update the position of the tangent vector
    // we distinguish three cases, depending whether c is smaller, equal or greater than a.
    if (c < a){
        // hyperbolic trajectory
        omega = sqrt(a * a - c * c);
        mat3 T = mat3(
        1., 0., 0.,
        0., a / omega, -c / omega,
        0., -c / omega, a / omega
        );
        mat3 Tinv = mat3(
        1., 0., 0.,
        0., a / omega, c / omega,
        0., c / omega, a / omega
        );
        mat3 shift = mat3(
        cosh(omega * t), 0., sinh(omega * t),
        0., 1., 0.,
        sinh(omega * t), 0., cosh(omega *t)
        );

        mat3 m = T * shift * Tinv;
        v.pos.xyz = m * v.pos.xyz;
        v.pos.w = phi + atan(v.pos.y, v.pos.x);
    }
    else if (c == a) {
        // parabolic trajectory
        // todo. replace this by an asymptotic expension of the other two cases when  | a - c | << 1.
        v.pos.xyz = vec3(
            t / sqrt2,
            - 0.25 * t * t,
            1. + 0.25 * t * t
        );
        v.pos.w = phi + atan(v.pos.y, v.pos.x);
    }
    else {
        // remaining case c > a
        // elliptic trajectory
        omega = sqrt(c * c - a * a);
        mat3 T = mat3(
        1., 0., 0.,
        0., c / omega, -a / omega,
        0., -a / omega, c / omega
        );
        mat3 Tinv = mat3(
        1., 0., 0.,
        0., c / omega, a / omega,
        0., a / omega, c / omega
        );
        mat3 rot = mat3(
            cos(omega * t), -sin(omega * t), 0.,
            sin(omega * t), cos(omega * t), 0.,
            0., 0., 1.
        );

        mat3 m = T * rot * Tinv;
        v.pos.xyz = m * v.pos.xyz;
        v.pos.w = phi + atan(v.pos.y, v.pos.x) + 2. * floor(0.5 - 0.25 * omega * t / PI) * PI;
    }

    // update the direction of the tangent vector
    // recall that tangent vectors at the origin have the form (ux,uy,0,uw)
    // so we work with 3x3 matrics applied to local_dir.xyw
    mat3 S = mat3(
    cos(2. * c * t), -sin(2. * c * t), 0.,
    sin(2. * c * t), cos(2. * c * t), 0.,
    0., 0., 1.
    );
    v.local_dir.xyw = S * v.local_dir.xyw;

    // reverse the preparation done at the beginning
    rotateBy(alpha, v);
    if(flipped) {
        flip(v);
    }
    translate(isom, v);
    //reduce the errors
    unit(v);
}


//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

/*
TODO. Check if needed in general ? Geometry dependent ?

*/

//project point back onto the geometry
vec4 geomProject(vec4 p){
    return p;
}

//Project onto the Klein Model
vec4 modelProject(vec4 p){
    return p;

}

//----------------------------------------------------------------------------------------------------------------------
// LIGHT
//----------------------------------------------------------------------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if (FAKE_LIGHT_FALLOFF){
        //fake linear falloff
        return dist;
    }
    return dist*dist;
}


//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;
}

/*
float ellipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x, p.y, p.z/2., 1.), center) - radius;
}

float fatEllipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x/10., p.y/10., p.z, 1.), center) - radius;
}

float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


float vertexSDF(vec4 p, vec4 cornerPoint, float size){
    return sphereSDF(abs(p), cornerPoint, size);
}

float horizontalHalfSpaceSDF(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}


float sliceSDF(vec4 p) {
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -1.);
    return max(HS1, HS2);
}

float cylSDF(vec4 p, float r){
    return sphereSDF(vec4(p.x, p.y, 0., 1.), ORIGIN, r);
}
*/


//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
Isometry identity=Isometry(vec4(0., 0., 1., 0.));
Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;

//----------------------------------------------------------------------------------------------------------------------
// Translation & Utility Variables
//----------------------------------------------------------------------------------------------------------------------
uniform int isStereo;
uniform vec2 screenResolution;
uniform vec4 invGenerators[6];//
uniform vec4 currentBoostMat;
uniform vec4 leftBoostMat;
uniform vec4 rightBoostMat;
uniform mat4 facing;
uniform mat4 leftFacing;
uniform mat4 rightFacing;
uniform vec4 cellBoostMat;
uniform vec4 invCellBoostMat;

//----------------------------------------------------------------------------------------------------------------------
// Lighting Variables & Global Object Variables
//----------------------------------------------------------------------------------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform vec4 globalObjectBoostMat;
uniform float globalSphereRad;
uniform samplerCube earthCubeTex;
uniform float time;
uniform float lightRad;

uniform int display;
// 1=tiling
// 2= planes
// 3= dragon skin

uniform int res;

//adding one local light (more to follow)
vec4 localLightPos=vec4(0.1, 0.1, -0.2, 1.);
vec4 localLightColor=vec4(1., 1., 1., 0.2);

//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);


//----------------------------------------------------------------------------------------------------------------------
// Re-packaging isometries, facings in the shader
//----------------------------------------------------------------------------------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function


//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    float tilingDist;
    float dragonDist;
    float planesDist;
    float lightDist;
    float distance = MAX_DIST;

    /*
    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    if (lightDist < EPSILON){
        //LIGHT=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }


    if (display==3){ //dragon
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==4){ //dragon tiling
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==1){ //tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = ellipsoidSDF(p, center, 0.32);
        tilingDist=-sphere;


        //cut out a vertical cylinder to poke holes in the top, bottom
        //    float cyl=0.0;
        //    cyl=cylSDF(p,0.2);
        //    tilingDist= -min(sphere, cyl);
        //

        //instead, cut out two balls from the top, bottom
        //right now not working well because of the sphere distance function
        //    float topSph=0.0;
        //    float bottomSph=0.0;
        //    float spheres=0.;
        //    topSph=sphereSDF(p, vec4(0.,0.,z0,1.),0.7);
        //    bottomSph=sphereSDF(p, vec4(0.,0.,-z0,1.),0.7);
        //    spheres=min(topSph,bottomSph);
        //    tilingDist=-min(sphere,spheres);

        distance=min(distance, tilingDist);

        if (tilingDist < EPSILON){
            // LIGHT=false;
            hitWhich=3;
            return tilingDist;
        }
    }

    if (display==2){ //planes
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.5);

        planesDist = -sphere;
        distance=min(distance, planesDist);
        if (planesDist < EPSILON){

            hitWhich=3;
            return planesDist;
        }
    }
    */
    return distance;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.1
        //    1.0/(10.0*lightIntensities[i].w)
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    //Global Sphere Object

    //float objDist = sliceSDF(absolutep);
    //float slabDist;
    float sphDist;
    //slabDist = sliceSDF(absolutep);
    sphDist=sphereSDF(absolutep, globalObjectBoostMat, 0.5);
    //objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;
    distance = min(distance, sphDist);

    //global plane


    //    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    //    //objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    //    objDist = sphereSDF(absolutep, globalObjPos, 0.1);
    //
    //
    //
    //    distance = min(distance, objDist);
    //    if (distance < EPSILON){
    //        hitWhich = 2;
    //    }


    return distance;
    // return MAX_DIST;
}


// check if the given point p is in the fundamental domain of the lattice.


bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);

    /*
        //lattice basis divided by the norm square
        vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
        vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
        vec4 v3 = vec4(0., 0., 1./z0, 0.);

        if (display!=3){
            if (dot(p, v3) > 0.5) {
                fixMatrix = Isometry(invGenerators[4]);
                return true;
            }
            if (dot(p, v3) < -0.5) {
                fixMatrix = Isometry(invGenerators[5]);
                return true;
            }
        }

        if (dot(p, v1) > 0.5) {
            fixMatrix = Isometry(invGenerators[0]);
            return true;
        }
        if (dot(p, v1) < -0.5) {
            fixMatrix = Isometry(invGenerators[1]);
            return true;
        }
        if (dot(p, v2) > 0.5) {
            fixMatrix = Isometry(invGenerators[2]);
            return true;
        }
        if (dot(p, v2) < -0.5) {
            fixMatrix = Isometry(invGenerators[3]);
            return true;
        }
        */
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------


//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
tangVector estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
    // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
    float newEp = EPSILON * 10.0;
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    if (hitWhich != 3){ //global light scene
        //p+EPSILON * basis_x should be lorentz normalized however it is close enough to be good enough
        tangVector tv = newTangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);

    }
    else { //local scene
        tangVector tv = newTangVector(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);
    }
}


//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// raymarch algorithm
// each step is the march is made from the previously achieved position (useful later for Sol).
// done with general vectors

int BINARY_SEARCH_STEPS=4;

void raymarch(tangVector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    tangVector tv = clone(rayDir);
    tangVector localtv = clone(rayDir);
    tangVector testlocaltv = clone(rayDir);
    tangVector bestlocaltv = clone(rayDir);
    totalFixMatrix = identity;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);


            if (localDist < EPSILON){
                sampletv = clone(localtv);
                break;
            }
            marchStep = localDist;

            //flow(marchStep, localtv);

            //            if (isOutsideCell(localtv, fixMatrix)){
            //                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            //                translate(fixMatrix, localtv);
            //                unit(localtv);
            //                marchStep = MIN_DIST;
            //            }

            testlocaltv = clone(localtv);
            flow(marchStep, testlocaltv);
            if (isOutsideCell(testlocaltv, fixMatrix)){
                bestlocaltv = testlocaltv;

                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    ////// do binary search to get close to but outside this cell -
                    ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5, float(j+1))*localDist;
                    testlocaltv = clone(localtv);
                    flow(testMarchStep, testlocaltv);
                    if (isOutsideCell(testlocaltv, testFixMatrix)){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixMatrix = testFixMatrix;
                    }
                }

                localtv = bestlocaltv;
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                translate(fixMatrix, localtv);
                unit(localtv);
                //globalDepth += marchStep;
                marchStep = MIN_DIST;
            }

            else {
                localtv = testlocaltv;
                globalDepth += marchStep;
            }
        }
        localDepth=min(globalDepth, MAX_DIST);
    }
    else {
        localDepth=MAX_DIST;
    }


    //            else {
    //                float localDist = min(.5, localSceneSDF(localtv.pos));
    //                if (localDist < EPSILON){
    //                    //hitWhich = 3;
    //                    sampletv = toTangVector(localtv);
    //                    break;
    //                }
    //                marchStep = localDist;
    //                globalDepth += localDist;
    //            }
    //        }
    //        localDepth = min(globalDepth, MAX_DIST);
    //    }
    //    else {
    //        localDepth=MAX_DIST;
    //    }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            flow(marchStep, tv);

            /*
            if (i == 2) {
                hitWhich = 5;
                debugColor = abs(tv.local_dir.xyz);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identity;
                sampletv = clone(tv);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Lighting Functions
//----------------------------------------------------------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(vec4 SP, vec4 TLP, tangVector V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    tangVector L = tangDirection(SP, TLP);
    tangVector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV, 10.0);
    //Attenuation - Of the Light Intensity
    float distToLight = fakeDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
    //Compute final color
    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(Isometry totalFixMatrix, vec3 color){
    vec4 SP = sampletv.pos;
    vec4 TLP;//translated light position
    // TODO: ask Steve about that : include a reflexion method to the `tangVector` structure ?
    tangVector V = newTangVector(SP, -sampletv.global_dir);

    vec3 surfColor;
    surfColor=0.2*vec3(1.)+0.8*color;

    if (display==3||display==4){ //for the dragon skin one only
        surfColor=0.7*vec3(1.)+0.3*color;//make it brighter when there's less stuff
    }
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't

    //GLOBAL LIGHTS THAT WE DONT ACTUALLY RENDER
    for (int i = 0; i<4; i++){
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, lightPositions[i]);
        color += lightingCalculations(SP, TLP, V, surfColor, lightIntensities[i]);
    }


    //LOCAL LIGHT
    color+= lightingCalculations(SP, localLightPos, V, surfColor, localLightColor);
    //light color and intensity hard coded in


    //move local light around by the generators to pick up lighting from nearby cells
    for (int i=0; i<6; i++){
        //TLP=invGenerators[i]*localLightPos;
        TLP = translate(makeLeftTranslation(invGenerators[i]), localLightPos);
        color+= lightingCalculations(SP, TLP, V, surfColor, localLightColor);
    }

    return color;
}


//EARTH TEXTURING COLOR COMMANDS

// return the two smallest numbers in a triplet
vec2 smallest(vec3 v)
{
    float mi = min(v.x, min(v.y, v.z));
    float ma = max(v.x, max(v.y, v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi, me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
// TODO. Check with Steve how to make this part geometry independent.
vec3 boxMapping(sampler2D sam, tangVector point)
{ // from Inigo Quilez
    vec4 m = point.global_dir*point.global_dir; m=m*m; m=m*m;

    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

// TODO. Rémi: not sure what it does.
vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    Isometry aux = makeInvLeftTranslation(globalObjectBoostMat);
    pt = translate(aux, pt);
    return tangDirection(ORIGIN, pt).global_dir.xyz;
}



vec3 lightColor(Isometry totalFixMatrix, tangVector sampletv, vec3  colorOfLight){
    N = estimateNormal(sampletv.pos);
    vec3 color;
    color = phongModel(totalFixMatrix, 0.5 * colorOfLight);
    color = 0.7 * color + 0.3;
    return color;
}

vec3 ballColor(Isometry totalFixMatrix, tangVector sampletv){
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixMatrix, color);
        //color = 0.9*color+0.1;
        return 0.5 * color + 0.5 * color2;
    }
    else {

        N = estimateNormal(sampletv.pos);
        vec3 color=localLightColor.xyz;
        color = phongModel(totalFixMatrix, 0.5*color);
        color = 0.7*color+0.3;
        return color;


        //generically gray object (color= black, glowing slightly because of the 0.1)
    }

}


vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
    vec4 samplePos=modelProject(sampletv.pos);

    //IF WE HIT THE TILING
    float x=samplePos.x;
    float y=samplePos.y;
    float z=samplePos.z;
    x = 0.9 * x / modelHalfCube;
    y = 0.9 * y / modelHalfCube;
    z = 0.9 * z / modelHalfCube;
    vec3 color = vec3(x, y, z);

    N = estimateNormal(sampletv.pos);
    color = phongModel(totalFixMatrix, 0.1*color);

    return 0.9*color+0.1;

    //adding a small constant makes it glow slightly
    //}
    //    else {
    //        //if we are doing TRUE LIGHTING
    //        // objects have no natural color, only lit by the lights
    //        N = estimateNormal(sampletv.pos);
    //        vec3 color=vec3(0., 0., 0.);
    //        color = phongModel(totalFixMatrix, color);
    //        return color;
    //    }
}


//----------------------------------------------------------------------------------------------------------------------
// Tangent Space Functions
//----------------------------------------------------------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2 * ((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1 / tan(radians(fov * 0.5));
    // code specific to SL2 (change the system of coordinates to make it coherent with the other geometries ?)
    // see the notes for the justification
    // TODO this part is not geometry independent.
    mat4 localbasis = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
    0, 0, 0, 0
    );
    vec4 dir = localbasis * vec4(xy, -z, 0.);
    tangVector tv = newTangVector(ORIGIN, dir);
    unit(tv);
    return tv;
}

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    setResolution(res);
    currentBoost = unserialize(currentBoostMat);
    leftBoost = unserialize(leftBoostMat);
    rightBoost = unserialize(rightBoostMat);
    cellBoost = unserialize(cellBoostMat);
    invCellBoost = unserialize(invCellBoostMat);
    globalObjectBoost = unserialize(globalObjectBoostMat);


        //stereo translations ----------------------------------------------------
        bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
        tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

        if (isStereo == 1){
            if (isLeft){
                rotateByFacing(leftFacing, rayDir);
                translate(leftBoost, rayDir);
            }
            else {
                rotateByFacing(rightFacing, rayDir);
                translate(rightBoost, rayDir);
            }
        }
        else {
            rotateByFacing(facing, rayDir);
            translate(currentBoost, rayDir);
        }

        //get our raymarched distance back ------------------------


    Isometry totalFixMatrix = identity;
    // do the marching
    raymarch(rayDir, totalFixMatrix);
    //flow(15.*PI,rayDir);
    //hitWhich = 5;
    //debugColor = abs(rayDir.local_dir.xyz);


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    // TODO. Replace by a switch instruction ?
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.2);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        //out_FragColor=vec4(1.0,0.,0., 1.0);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        //out_FragColor=vec4(1.0,0.,0., 1.0);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich==3) {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        return;
    }
}