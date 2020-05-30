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
//const float fov = 90.0;
const float fov = 120.0;

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
    mat4 J = mat4(
    -1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 0
    );
    float q = dot(elt, J * elt);
    return elt / sqrt(-q);
}

// change of model
// return the 2x2 matrix corresponding to elt
// Todo. Check if this is really needed
mat2 SLtoMatrix2(vec4 elt) {
    mat2 ex = mat2(
    1, 0,
    0, 1
    );
    mat2 ey = mat2(
    0, -1,
    1, 0
    );
    mat2 ez = mat2(
    0, 1,
    1, 0
    );
    mat2 ew = mat2(
    1, 0,
    0, -1
    );
    return elt.x * ex + elt.y * ey + elt.z * ez + elt.w * ew;
}
// change of model
// take a 2x2 matrix and return the corresponding element
vec4 SLfromMatrix2(mat2 m) {
    float a = m[0][0];
    float b = m[1][0];
    float c = m[0][1];
    float d = m[1][1];
    return 0.5 * vec4(a + d, b - c, b + c, a - d);
}

// Projection from SL(2,R) to SO(2,1)
mat3 SLtoMatrix3(vec4 elt){
    mat4x3 aux1 = mat4x3(
    elt.x, elt.y, elt.z,
    -elt.y, elt.x, elt.w,
    elt.z, elt.w, elt.x,
    -elt.w, elt.z, elt.y
    );
    mat3x4 aux2 = mat3x4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y
    );
    mat3 res = aux1 * aux2;
    return res;
}

// Projection onto H^2
vec3 SLtoH2(vec4 elt) {
    mat3 m = SLtoMatrix3(elt);
    vec3 res = vec3(0., 0., 1.);
    res = m * res;
    // reduce the potential error
    // the point should be on a hyperboloid
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(res, J * res);
    res = res / sqrt(-q);
    return res;
}

// Return the inverse of the given element
vec4 SLgetInverse(vec4 elt) {
    vec4 res = vec4(elt.x, -elt.yzw);
    return SLreduceError(res);
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


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Point
//----------------------------------------------------------------------------------------------------------------------

/*

    Data type for points in the space X
    A point x in X is represented by a pair (proj,fiber) where
    - proj is the projection of x to SL(2,R) seen as a vec4 (in the basis E)
    - fiber is the fiber coordinates (!)

    The goal of this choice is to perform as many computations in SL(2,R) rather than in X.
    Hopefully this will reduce numerical erros related to the atan function

*/

struct Point {
    vec4 proj;// the projection of the point to SL(2,R)
    float fiber;// the fiber component
};

// origin of the space
// - the projection corresponds to the identity in SL(2,R)
// - the fiber component is zero
const Point ORIGIN = Point(vec4(1, 0, 0, 0), 0.);

// reduce the erors on the SL(2,R) component of the point
void reduceError(inout Point p) {
    p.proj = SLreduceError(p.proj);
}

// change of model
// the input is a vector (x,y,z,w) representing a point p where
// - (x,y,z) is the projection of p in H^2 (hyperboloid model)
// - w is the fiber coordinate
Point fromVec4(vec4 p) {
    vec4 proj = vec4(
    sqrt(0.5 * p.z + 0.5),
    0.,
    p.x / sqrt(2. * p.z + 2.),
    p.y / sqrt(2. * p.z + 2.)
    );
    proj = SLtranslateFiberBy(proj, p.w);
    Point res =  Point(proj, p.w);
    reduceError(res);
    return res;
}

// change of model
// the output is a vector (x,y,z,w) representing a point p where
// - (x,y,z) is the projection of p in H^2 in the **hyperboloid** model
// - w is the fiber coordinate
vec4 toVec4(Point p) {
    vec4 res;
    res.xyz = SLtoH2(p.proj);
    res.w = p.fiber;
    return res;
}

// change of model
// the output is a vector (x,y,1,w) representing a point p where
//// - (x,y) is the projection of p in H^2 in the **Klein** model
//// - w is the fiber coordinate
vec4 toKlein(Point p){
    vec4 res = toVec4(p);
    res.xyz = res.xyz / res.z;
    return res;
}

// unserialize the data received from the shader to create a point
Point unserializePoint(vec4 data) {
    return fromVec4(data);
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Isometry
//----------------------------------------------------------------------------------------------------------------------

/*

  Data type for manipulating isometries of the space
  In this geometry we only consider as isometries the element of X acting on itself on the left.
  If x is a point of X, the isometry L_x sending the origin to x is represented by the point x

*/

struct Isometry {
    Point target;// the image of the origin by this isometry.
};

// reduce error form the target
void reduceError(Isometry isom) {
    reduceError(isom.target);
}

// Method to unserialized isometries passed to the shader
Isometry unserializeIsom(vec4 data) {
    Point p = fromVec4(data);
    return Isometry(p);
}

// Product of two isometries (more precisely isom1 * isom2)
Isometry composeIsometry(Isometry isom1, Isometry isom2) {
    vec4 proj = SLmultiply(isom1.target.proj, isom2.target.proj);
    vec4 aux = SLtranslateFiberBy(proj, -isom1.target.fiber - isom2.target.fiber);
    float fiber = isom1.target.fiber + isom2.target.fiber + 2. * atan(aux.y, aux.x);
    Point target = Point(proj, fiber);
    reduceError(target);
    return Isometry(target);
}

// Return the inverse of the given isometry
Isometry getInverse(Isometry isom) {
    vec4 proj = SLgetInverse(isom.target.proj);
    Point target = Point(proj, -isom.target.fiber);
    reduceError(target);
    return Isometry(target);
}

// Return the isometry sending the origin to p
Isometry makeLeftTranslation(Point target) {
    return Isometry(target);
}

// Return the isometry sending p to the origin
Isometry makeInvLeftTranslation(Point p) {
    return getInverse(makeLeftTranslation(p));
}

// Translate a point by the given isometry
Point translate(Isometry isom, Point p) {
    Isometry aux = makeLeftTranslation(p);
    aux = composeIsometry(isom, aux);
    return aux.target;
}

// Perfom a rotation (meant in the H^2 component) by the given angle
// It does not affact the fiber component
void rotateBy(float angle, inout Point p) {
    mat4 rot = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, cos(angle), sin(angle),
    0, 0, -sin(angle), cos(angle)
    );
    p.proj = rot * p.proj;
    reduceError(p);
}

// Flip the point (see Jupyter Notebook)
// It reverses the fiber
void flip(inout Point p) {
    mat4 flip = mat4(
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0
    );
    p.proj = flip * p.proj;
    p.fiber = - p.fiber;
    reduceError(p);
}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT Vector
//----------------------------------------------------------------------------------------------------------------------


/*
  Data type for manipulating points in the tangent bundle
  A Vector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Local direction are vec3 written in the orthonormal basis (e_x, e_y, e_phi) where
  . e_x is the direction of the x coordinate of H^2
  . e_y is the direction of the y coordinate in H^2
  . e_phi is the direction of the fiber

  Implement various basic methods to manipulate them

*/


struct Vector {
    Point pos;// position on the manifold
    vec3 dir;// pull back of the tangent vector at the origin written in the appropriate basis
};

// return a copy of the vector
Vector clone(Vector v) {
    return Vector(v.pos, v.dir);
}


//----------------------------------------------------------------------------------------------------------------------
// Conversion between global and local representations of tangent vectors
//----------------------------------------------------------------------------------------------------------------------

/*

The methods below compute (if needed) the global/local direction of the given tangent vector
The tangent vector is passed as a reference, hence it is altered by the function

*/

// Return the differential of the isometry sending the origin to target
mat4 diffTranslation(Point target) {
    vec4 aux = toVec4(target);
    float x = aux.x;
    float y = aux.y;
    float z = aux.z;
    float w = aux.w;
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
mat4 diffInvTranslation(Point target) {
    vec4 aux = toVec4(target);
    float x = aux.x;
    float y = aux.y;
    float z = aux.z;
    float w = aux.w;
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


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------


// overlaod using Vector
Isometry makeLeftTranslation(Vector v) {
    return makeLeftTranslation(v.pos);
}

// overlaod using Vector
Isometry makeInvLeftTranslation(Vector v) {
    return makeInvLeftTranslation(v.pos);
}

// overload to translate a direction
void translate(Isometry isom, inout Vector v) {
    v.pos = translate(isom, v.pos);
}


// rotate the tangent vector (position and direction around the fiber by an angle alpha)
void rotateBy(float angle, inout Vector v) {
    // rotation of the position part
    rotateBy(angle, v.pos);

    mat3 rotD = mat3(
    cos(angle), sin(angle), 0,
    -sin(angle), cos(angle), 0,
    0, 0, 1
    );
    v.dir = rotD * v.dir;
}

// flip the tangent vector (see Jupyter Notebook)
void flip(inout Vector v) {
    flip(v.pos);

    mat3 flip = mat3(
    0, 1, 0,
    1, 0, 0,
    0, 0, -1
    );
    v.dir = flip * v.dir;
}

// apply a local rotation of the direction
void rotateByFacing(mat4 A, inout Vector v){
    // notice that the facing is an element of SO(3) which refers to the basis (e_x, e_y, e_phi).
    vec4 aux = vec4(v.dir, 0.);
    aux = A * aux;
    v.dir = aux.xyz;
}


//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/


// Add two tangent vector at the same point (return v1 + v2)
Vector add(Vector v1, Vector v2) {
    // return the added vectors
    return Vector(v1.pos, v1.dir + v2.dir);
}

// subtract two tangent vector at the same point (return v1 - v2)
Vector sub(Vector v1, Vector v2) {
    // return the added vectors
    return Vector(v1.pos, v1.dir - v2.dir);
}

// scalar multiplication of a tangent vector (return a * v)
Vector scalarMult(float a, Vector v) {
    return Vector(v.pos, a * v.dir);
}


// dot product of the two vectors
float tangDot(Vector v1, Vector v2){
    return dot(v1.dir, v2.dir);
}

// calculate the length of a tangent vector
float tangNorm(Vector v){
    return sqrt(tangDot(v, v));
}

// create a unit tangent vector (in the tangle bundle)
// when possible use the normalization method below
Vector tangNormalize(Vector v){
    // length of the vector
    float length = tangNorm(v);
    return Vector(v.pos, v.dir / length);
}

// normalize the given vector
// called unit because normalize is a protected name
void unit(inout Vector v) {
    // length of the vector
    float length = tangNorm(v);
    v.dir = v.dir / length;
}


// cosAng between two vector in the tangent bundle
float cosAng(Vector v1, Vector v2){
    return tangDot(v1, v2);
}

Vector turnAround(Vector v){
    return Vector(v.pos, -v.dir);
}


//reflect the unit tangent vector u off the surface with unit normal nVec
Vector reflectOff(Vector v, Vector normal){
    return add(scalarMult(-2.0 * tangDot(v, normal), normal), v);
}


/*

For the next four method,
we implictely assume that we have a prefered basis f = (f_x, f_y, f_z)
at of the tangent space at the point p

The first function compute (an approximation of) the point
obtained from p by following for a time eps the pass directed a vector given in the coordinates of f

The last method takes the coordinates of a tangent vector in this basis and return the corresponding tangent vector

Here the basis at p is the image by dL of the standard basis at the origin.

*/


Point smallShift(Point p, vec3 dp) {
    vec4 aux0 = toVec4(p);

    mat4 dL = diffTranslation(p);
    mat3x4 localBasis = mat3x4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 1
    );

    vec4 aux1 = aux0 + dL * localBasis * dp;
    Point res = fromVec4(aux1);
    reduceError(res);
    return res;
}

Vector createVector(Point p, vec3 dp) {
    return Vector(p, dp);
}


//----------------------------------------------------------------------------------------------------------------------
// GLOBAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods computing ``global'' objects
*/

// fake distance between two points
float fakeDistance(Point p1, Point p2){

    Isometry isom = makeInvLeftTranslation(p1);
    vec4 aux = toVec4(translate(isom, p2));
    vec3 oh = vec3(0, 0, 1);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(aux.xyz, J * oh);
    return sqrt(pow(acosh(-q), 2.) + pow(aux.w, 2.));

    //vec4 aux1 = toVec4(p1);
    //vec4 aux2 = toVec4(p2);
    //return length(aux2 - aux1);
}

// overload of the previous function in case we work with tangent vectors
float fakeDistance(Vector v1, Vector v2){
    return fakeDistance(v1.pos, v2.pos);
}

// distance between two points
float exactDist(Point p1, Point p2){
    return fakeDistance(p1, p2);
}

// overload of the previous function in case we work with tangent vectors
float exactDist(Vector v1, Vector v2){
    return exactDist(v1.pos, v2.pos);
}


// return the tangent vector at p point to q
Vector tangDirection(Point p, Point q){
    vec4 auxp = toVec4(p);
    vec4 auxq = toVec4(q);
    mat4 dLinv = diffInvTranslation(p);
    vec4 global_dir = auxq - auxp;
    Vector res = Vector(p, (dLinv * global_dir).xyw);
    unit(res);
    return res;
}

// overload of the previous function in case we work with tangent vectors
Vector tangDirection(Vector u, Vector v){
    return tangDirection(u.pos, v.pos);
}


// flow the given vector during time t using exact formulas
// this method is to be called  by `flow`
// we make the following assumtions
// - the initial position of v is the origin
// - the local direction of v is set up
// - the initial direction has the local form (a, 0, c), with a,c > 0
void _exactFlow(float t, inout Vector v) {
    float a = v.dir.x;
    float c = v.dir.z;

    float phi = c * t;// the angle in the fiber achieved by the geodesic (before final adjustment)
    float omegaSq = 0.;
    float omega = 0.;// the "pulsatance" involved in the geodesic flow.
    float theta = 0.;// the rotation angle in H^2.


    // the solution has an easy description as a product of 2 x 2 matrices.
    // it is a product of isom * spin where
    // - isom is a one-parameter subgroup of SL(2,R) (elliptic, parabolic, or hyperbolic)
    // - spin is a one-parameter subgroup of SL(2,R) fixing the origin of H^2.
    // we use this form, and then convert it into a vec4

    // the spin part is always the same.
    mat2 spin = mat2(
    cos(c * t), -sin(c * t),
    sin(c * t), cos(c * t)
    );
    // to get the fiber angle we will go through the projection of the point in H^2
    // (see Jupyter Notebook)

    // we distinguish three cases, depending whether c is smaller, equal or greater than a.
    // it corresponds to the three cases for isom (elliptic, parabolic, or hyperbolic).

    /*
    // little hack to see the junction between elliptic/hyperbolic behavior
    if (abs(c-a) < 0.002) {
        hitWhich = 5;
    }
    */

    //if (abs(c-a)*t < 0.05) {
    if (abs(c-a) ==0.) {
        // "parabolic" trajectory
        // we use an asymptotic expansion of the solution around the critical case (c = a) to reduce the noise.
        float a2 = a * a;
        float omega2 = a * a - c * c;
        float omega4 = omega2 * omega2;
        float omega6 = omega4 * omega2;
        float omega8 = omega6 * omega2;
        float t2 = t * t;
        float t3 = t2 * t;
        float t4 = t3 * t;
        float t5 = t4 * t;
        float t6 = t5 * t;
        float t7 = t6 * t;
        float t8 = t7 * t;

        mat2 even = mat2(1);
        mat2 odd = mat2(0, a + c, a - c, 0);
        mat2 isom = even;
        isom = isom + t * (1. / 2.) * odd;
        isom = isom + (1./2.) * t2 * (1. / 4.) * omega2 * even;
        isom = isom + (1./6.) * t3 * (1. / 8.) * omega2 * odd;
        isom = isom + (1./24.) * t4 * (1. / 16.) * omega4 * even;
        isom = isom + (1./120.) * t5 * (1. / 32.) * omega4 * odd;
        isom = isom + (1./720.) * t6 * (1. / 64.) * omega6 * even;
        isom = isom + (1./5040.) * t7 * (1. / 128.) * omega6 * odd;
        isom = isom + (1./40320.) * t8 * (1. / 256.) * omega8 * even;

        v.pos.proj = SLfromMatrix2(isom * spin);

        // the spin fixes the origin, no need to take into accound for the projection onto H^2.
        mat3 m = SLtoMatrix3(SLfromMatrix2(isom));
        vec3 h2point = m * vec3(0, 0, 1);

        float tanTheta = - a * c * t / 2. - a * c * omega2 * t3 / 24. - a * c * omega4 * t5 / 720. - a * c * omega6 * t7 / 40320.;
        tanTheta = tanTheta /(a + a * t2 * omega2 / 6. + a * t4 * omega4 / 120. + a * t6 * omega6 /5040.);
        v.pos.fiber = phi + atan(tanTheta);

    }
    else if (c < a){
        // hyperbolic trajectory
        omegaSq = a * a - c * c;
        omega = sqrt(omegaSq);

        mat2 isom = mat2(
        cosh(0.5 * omega * t), omega * sinh(0.5 * omega * t) / (a-c),
        omega * sinh(0.5 * omega * t) / (a+c), cosh(0.5 * omega * t)
        );
        v.pos.proj = SLfromMatrix2(isom * spin);

        // the spin fixes the origin, no need to take into accound for the projection onto H^2.
        mat3 m = SLtoMatrix3(SLfromMatrix2(isom));
        vec3 h2point = m * vec3(0, 0, 1);

        // hack to fix atan numerical errors
        float tanOmegaTOver2Sq = - omegaSq * h2point.y / (2. * a * c  - omegaSq * h2point.y);
        float tanTheta = - c / omega * sqrt(tanOmegaTOver2Sq);

        v.pos.fiber = phi + atan(tanTheta);

    }
    else {
        // remaining case c > a
        // elliptic trajectory

        omegaSq = c * c - a * a;
        omega = sqrt(omegaSq);

        mat2 isom = mat2(
        cos(0.5 * omega * t), -omega * sin(0.5 * omega * t) / (a-c),
        -omega * sin(0.5 * omega * t) / (a+c), cos(0.5 * omega * t)
        );
        v.pos.proj = SLfromMatrix2(isom * spin);

        // the spin fixes the origin, no need to take into accound for the projection onto H^2.
        mat3 m = SLtoMatrix3(SLfromMatrix2(isom));
        vec3 h2point = m * vec3(0, 0, 1);
        // for the moment a computation without fixing `atan`
        float aux = floor(0.5 * omega * t / PI + 0.5);

        // hack to fix atan numerical errors
        float tanOmegaTOver2Sq = - omegaSq * h2point.y / (2. * a * c  + omegaSq * h2point.y);
        float tanTheta =0.;
        float remainder = t - aux * (2. * PI / omega);
        if (remainder > 0.) {
            tanTheta = - c / omega * sqrt(tanOmegaTOver2Sq);
        }
        else {
            tanTheta = c / omega * sqrt(tanOmegaTOver2Sq);
        }

        v.pos.fiber = phi + atan(tanTheta) - aux * PI;

    }

    // update the direction of the tangent vector
    // recall that tangent vectors at the origin have the form (ux,uy,uphi)
    // so we work with 3x3 matrics applied to local_dir
    mat3 S = mat3(
    cos(2. * c * t), -sin(2. * c * t), 0.,
    sin(2. * c * t), cos(2. * c * t), 0.,
    0., 0., 1.
    );
    v.dir = S * v.dir;
}


// flow the given vector during time t
void flow(float t, inout Vector v) {
    // prepation : set the vector into an easier form to flow

    // isometry sending the origin the the position of v
    Isometry isom = makeLeftTranslation(v);
    // pull back the tangent vector a the origin (very easy in the local representation)
    v.pos = ORIGIN;
    // flip if needed to get a positive fiber direction
    bool flipped = false;
    if (v.dir.z < 0.) {
        flipped = true;
        flip(v);
    }

    // rotation
    // the angle alpha is characterized as follows
    // if u is a tangent vector with the local form (a, 0, c) with a, c >= 0
    // then v is obtained from u by a rotation of angle alpha
    float alpha = atan(v.dir.y, v.dir.x);
    float c = v.dir.z;
    float a = sqrt(1. - c * c);
    v.dir = vec3(a, 0., c);

    //debugColor = abs(v.local_dir);

    // flow the vector
    _exactFlow(t, v);

    // reverse the preparation done at the beginning
    rotateBy(alpha, v);
    if (flipped) {
        flip(v);
    }
    translate(isom, v);

    //reduce the errors
    reduceError(v.pos);
    unit(v);

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


float sphereSDF(Point p, Point center, float radius){
    return exactDist(p, center) - radius;
}


float cylSDF(Point p, float r){
    vec4 aux = toVec4(p);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );

    float s = 0.;
    vec3 center = vec3(0., s, sqrt(1. + s * s));
    float q = dot(aux.xyz, J* center);
    return acosh(-q) - r;
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


*/


//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
Vector N;//normal vector
Vector sampletv;
vec4 globalLightColor;
Isometry identity=Isometry(ORIGIN);
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
Point localLightPos;
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

float localSceneSDF(Point p){
    float sphDist;
    float cylDist;
    float lightDist;
    float distance = MAX_DIST;

    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    if (lightDist < EPSILON){
        //LIGHT=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }

    // Sphere
    float aux = 0.;
    Point center = fromVec4(vec4(0., aux, sqrt(1. + aux * aux), 0.));
    sphDist = sphereSDF(p, center, 0.1);
    distance = min(distance, sphDist);
    if (sphDist<EPSILON){
        hitWhich=3;
        return sphDist;
    }

    // Cylinder
    //    cylDist = cylSDF(p, 0.3);
    //    if (cylDist<EPSILON){
    //        hitWhich=3;
    //        return sphDist;
    //    }

    return distance;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(Point p){
    // correct for the fact that we have been moving
    Point absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    float objDist;
    //Light Objects
    for (int i=0; i<4; i++){
        objDist = sphereSDF(absolutep, unserializePoint(lightPositions[i]), 0.1);
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }


    //Global Sphere Object
    Point globalObjPos = translate(globalObjectBoost, ORIGIN);
    objDist = sphereSDF(absolutep, globalObjPos, 0.2);

    // Global Cylinde Object
    //objDist = cylSDF(absolutep, 0.3);

    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
        return distance;
    }

    return distance;
}


// check if the given point p is in the fundamental domain of the lattice.
bool isOutsideCell(Point p, out Isometry fixMatrix){
    // point in the Klein model
    // (where the fundamental domain is convex polyhedron).
    vec4 klein = toKlein(p);

    // Normal defining the fundamental domain of SL(2,Z)
    vec4 n0 = vec4(0, -1, 0, 0);
    vec4 n2 = vec4(2, 1, 0, 0);
    vec4 n3 = vec4(-2, 1, 0, 0);
    vec4 n4 = vec4(0, 0, 0, 1);


    // lift of the rotation of angle pi around the origin
    Isometry gen0 = Isometry(Point(
    vec4(1, 0, 0, 0),
    - PI
    ));
    // lift the the parabolic z -> z - 1 (in the upper half plane model)
    Isometry gen2 = Isometry(Point(
    vec4(1, -0.5, -0.5, 0),
    -2. * atan(0.5)
    ));
    // lift the the parabolic z -> z + 1 (in the upper half plane model)
    // inverse of the previous one
    Isometry gen3 = Isometry(Point(
    vec4(1, 0.5, 0.5, 0),
    2. * atan(0.5)
    ));
    // translation by -4pi along the fiber
    Isometry gen4 = Isometry(Point(
    vec4(1, 0, 0, 0),
    -4. * PI
    ));
    // translation by 4pi along the fiber
    Isometry gen5 = Isometry(Point(
    vec4(1, 0, 0, 0),
    4. * PI
    ));

    // testing if the point is in the fundamental domain, and the matrix to fix it

    if (dot(klein, n0) > 0.) {
        fixMatrix = gen0;
        return true;
    }
    if (dot(klein, n2) > 1.) {
        fixMatrix = gen2;
        return true;
    }
    if (dot(klein, n3) > 1.) {
        fixMatrix = gen3;
        return true;
    }
    if (dot(klein, n4) > 2. * PI) {
        fixMatrix = gen4;
        //debugColor = vec3(1,0,0);
        return true;
    }
    if (dot(klein, n4) < -2. * PI) {
        fixMatrix = gen5;
        //debugColor = vec3(0,1,0);
        return true;
    }
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(Vector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------


//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
// the coordinates refer to a prefered basis, which is geometry dependent
// Remi : NOW GEOMETRY INDEPENDENT...
Vector estimateNormal(Point p) {
    float newEp = EPSILON * 10.0;

    Point shiftPX = smallShift(p, vec3(newEp, 0, 0));
    Point shiftPY = smallShift(p, vec3(0, newEp, 0));
    Point shiftPZ = smallShift(p, vec3(0, 0, newEp));
    Point shiftMX = smallShift(p, vec3(-newEp, 0, 0));
    Point shiftMY = smallShift(p, vec3(0, -newEp, 0));
    Point shiftMZ = smallShift(p, vec3(0, 0, -newEp));

    Vector n;

    if (hitWhich != 3){
        //global light scene
        n = createVector(p, vec3(
        globalSceneSDF(shiftPX) - globalSceneSDF(shiftMX),
        globalSceneSDF(shiftPY) - globalSceneSDF(shiftMY),
        globalSceneSDF(shiftPZ) - globalSceneSDF(shiftMZ)
        ));
    }
    else { //local scene
        n = createVector(p, vec3(
        localSceneSDF(shiftPX) - localSceneSDF(shiftMX),
        localSceneSDF(shiftPY) - localSceneSDF(shiftMY),
        localSceneSDF(shiftPZ) - localSceneSDF(shiftMZ)
        ));
    }
    unit(n);
    return n;
}


//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// raymarch algorithm
// each step is the march is made from the previously achieved position (useful later for Sol).
// done with general vectors

int BINARY_SEARCH_STEPS=4;

void raymarch(Vector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    Vector tv = clone(rayDir);
    Vector localtv = clone(rayDir);
    Vector testlocaltv = clone(rayDir);
    Vector bestlocaltv = clone(rayDir);
    totalFixMatrix = identity;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);


            if (localDist < EPSILON){
                sampletv = clone(localtv);
                break;
            }
            marchStep = min(localDist, 1.);
            flow(marchStep, localtv);


            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                translate(fixMatrix, localtv);
                unit(localtv);
                marchStep = MIN_DIST;
            }


            //                        testlocaltv = clone(localtv);
            //                        flow(marchStep, testlocaltv);
            //                        if (isOutsideCell(testlocaltv, fixMatrix)){
            //                            bestlocaltv = testlocaltv;
            //
            //                            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
            //                                ////// do binary search to get close to but outside this cell -
            //                                ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
            //                                testMarchStep = marchStep - pow(0.5, float(j+1))*localDist;
            //                                testlocaltv = clone(localtv);
            //                                flow(testMarchStep, testlocaltv);
            //                                if (isOutsideCell(testlocaltv, testFixMatrix)){
            //                                    marchStep = testMarchStep;
            //                                    bestlocaltv = testlocaltv;
            //                                    fixMatrix = testFixMatrix;
            //                                }
            //                            }
            //
            //                            localtv = bestlocaltv;
            //                            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            //                            translate(fixMatrix, localtv);
            //                            unit(localtv);
            //                            //globalDepth += marchStep;
            //                            marchStep = MIN_DIST;
            //                        }

            else {
                //localtv = testlocaltv;
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


            //            if (i == 1) {
            //                hitWhich = 5;
            //                vec4 aux = toVec4(tv.pos);
            //                debugColor = vec3(abs(tv.dir.xy),0);
            //                break;
            //            }



            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identity;
                sampletv = clone(tv);
                return;
            }
            //marchStep = min(globalDist,1.);
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------

/*
TODO. Check if needed in general ? Geometry dependent ?
*/

//project point back onto the geometry
Point geomProject(Point p){
    return p;
}

//Project onto the Klein Model
Point modelProject(Point p){
    return p;

}

//----------------------------------------------------------------------------------------------------------------------
// Lighting Functions
//----------------------------------------------------------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(Point SP, Point TLP, Vector V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    Vector L = tangDirection(SP, TLP);
    Vector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV, 10.0);
    //Attenuation - Of the Light Intensity
    float distToLight = fakeDistance(SP, TLP);
    float att = 0.6 * lightIntensity.w / (0.01 + lightAtt(distToLight));
    //Compute final color

    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(Isometry totalFixMatrix, vec3 color){
    Point SP = sampletv.pos;
    Point TLP;//translated light position
    Vector V = turnAround(sampletv);



    vec3 surfColor;
    surfColor = 0.2 * vec3(1.) + 0.8 * color;

    if (display == 3 || display == 4){ //for the dragon skin one only
        surfColor = 0.7 * vec3(1.) + 0.3 * color;//make it brighter when there's less stuff
    }
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't

    //GLOBAL LIGHTS THAT WE DONT ACTUALLY RENDER


    for (int i = 0; i<4; i++){
        Isometry totalIsom = composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, unserializePoint(lightPositions[i]));
        color += lightingCalculations(SP, TLP, V, surfColor, lightIntensities[i]);
    }


    //LOCAL LIGHT
    color+= lightingCalculations(SP, localLightPos, V, surfColor, localLightColor);
    //light color and intensity hard coded in

    //move local light around by the generators to pick up lighting from nearby cells
    for (int i=0; i<6; i++){
        //TLP=invGenerators[i]*localLightPos;
        TLP = translate(unserializeIsom(invGenerators[i]), localLightPos);
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

/*
// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
// TODO. Check with Steve how to make this part geometry independent.
vec3 boxMapping(sampler2D sam, Vector point)
{ // from Inigo Quilez
    vec4 m = point.dir * point.dir; m=m*m; m=m*m;

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
}*/

vec3 lightColor(Isometry totalFixMatrix, Vector sampletv, vec3  colorOfLight){
    N = estimateNormal(sampletv.pos);
    vec3 color;
    color = phongModel(totalFixMatrix, 0.5 * colorOfLight);
    color = 0.7 * color + 0.3;
    return color;
}

vec3 ballColor(Isometry totalFixMatrix, Vector sampletv){
    /*
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixMatrix, color);
        //color = 0.9*color+0.1;
        return 0.5 * color + 0.5 * color2;
    }
    else */
    {

        N = estimateNormal(sampletv.pos);
        vec3 color=localLightColor.xyz;
        color = phongModel(totalFixMatrix, 0.5*color);
        color = 0.7*color+0.3;
        return color;


        //generically gray object (color= black, glowing slightly because of the 0.1)
    }

}


vec3 tilingColor(Isometry totalFixMatrix, Vector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
    Point samplePos=modelProject(sampletv.pos);

    //IF WE HIT THE TILING
    vec4 aux = toVec4(samplePos);
    float x=aux.x;
    float y=aux.y;
    float z=aux.z;
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

Vector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2 * ((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1 / tan(radians(fov * 0.5));
    // code specific to SL2 (change the system of coordinates to make it coherent with the other geometries ?)
    // see the notes for the justification
    // TODO this part is not geometry independent,
    // unless we assume that the tangent space has a prefered basis at everypoint
    // or at least at the origin here
    vec3 dir = vec3(xy, -z);
    Vector tv = createVector(ORIGIN, dir);
    unit(tv);
    return tv;
}

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    setResolution(res);
    currentBoost = unserializeIsom(currentBoostMat);
    leftBoost = unserializeIsom(leftBoostMat);
    rightBoost = unserializeIsom(rightBoostMat);
    cellBoost = unserializeIsom(cellBoostMat);
    invCellBoost = unserializeIsom(invCellBoostMat);
    globalObjectBoost = unserializeIsom(globalObjectBoostMat);

    localLightPos = fromVec4(vec4(0.1, 0.1, -0.2, 1.));


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    Vector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

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
    //do the marching
    raymarch(rayDir, totalFixMatrix);

    /*
    Vector v = clone(rayDir);
    float T = 10.;
    int k = 10;
    float step = T / float(k);

    for (int i =0; i< k; i++) {
        flow(step, v);
    }
    vec4 aux = toVec4(v.pos);
    if (hitWhich !=5) {
        hitWhich =5;
        //debugColor = vec3(abs(aux.xy),0);
        debugColor = -vec3(aux.w/30., 0, 0);
    }*/



    vec3 pixelColor;
    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    switch (hitWhich){
        case 0://Didn't hit anything
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.2);
        break;

        case 1:// global lights
        //pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        //out_FragColor=vec4(pixelColor, 1.0);
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        break;

        case 2:// global object
        pixelColor= ballColor(totalFixMatrix, sampletv);
        //debugColor = abs(N.dir);
        //pixelColor = debugColor;
        out_FragColor=vec4(pixelColor, 1.0);
        break;

        case 3:// local objects
        pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        break;

        case 5:
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        break;
    }
}