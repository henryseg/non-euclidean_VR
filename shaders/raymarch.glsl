#version 300 es
out vec4 out_FragColor;


//----------------------------------------------------------------------------------------------------------------------
// PARAMETERS
//----------------------------------------------------------------------------------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

//determine what we draw: ball and lights, 
const bool GLOBAL_SCENE=false;
const bool TILING_SCENE=true;
const bool EARTH=false;

//const bool TILING=false;
//const bool PLANES=false;
//
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
// Auxiliary methods: computations in H2 and SL(2,R)
//----------------------------------------------------------------------------------------------------------------------


// A point in SL(2,R) is represented by a vec4 corresponding to its coordinates in the hyperboloid model
vec4 SL2reduceError(vec4 elt) {
    float q = elt.x * elt.x + elt.y * elt.y - elt.z * elt.z - elt.w * elt.w;
    return elt / sqrt(-q);
}

vec4 SL2rotateBy(vec4 elt, float alpha){
    mat4 R = mat4(
    cos(alpha), sin(alpha), 0, 0,
    - sin(alpha), cos(alpha), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    vec4 res = R * elt;
    res = SL2reduceError(res);
    return res;
}

vec4 SL2translateFiberBy(vec4 elt, float phi) {
    mat4 T = mat4(
    cos(phi), sin(phi), 0, 0,
    -sin(phi), cos(phi), 0, 0,
    0, 0, cos(phi), sin(phi),
    0, 0, -sin(phi), cos(phi)
    );
    vec4 res = T * elt;
    res = SL2reduceError(res);
    return res;
}

vec4 SL2flip(vec4 elt) {
    mat4 F = mat4(
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1
    );
    vec4 res = F * elt;
    res = SL2reduceError(res);
    return res;
}

mat3 SL2toMat3(vec4 elt){
    mat4 aux1 = mat4(
    elt.w, elt.z, elt.y, 0,
    -elt.z, elt.w, -elt.x, 0,
    elt.y, -elt.x, elt.w, 0,
    elt.x, elt.y, elt.z, 0
    );
    mat4 aux2 = mat4(
    elt.w, elt.z, elt.y, -elt.x,
    -elt.z, elt.w, -elt.x, -elt.y,
    elt.y, -elt.x, elt.w, elt.z,
    0, 0, 0, 0
    );
    mat3 res = mat3(aux1 * aux2);
    return res;
}

mat4 SL2toMat4(vec4 elt) {
    mat4 res = mat4(
    elt.w, elt.z, elt.y, elt.x,
    -elt.z, elt.w, -elt.x, elt.y,
    elt.y, -elt.x, elt.w, -elt.z,
    elt.x, elt.y, elt.z, elt.w
    );
    return res;
}

vec4 SL2multiply(vec4 elt1, vec4 elt2) {
    mat4 L1 = SL2toMat4(elt1);
    vec4 res = L1 * elt2;
    res = SL2reduceError(res);
    return res;
}


// the vectors in the lie algebra of SL(2,R) avec vectors of the form (x,y,z,w) with w = 0.

vec4 TSL2flip(vec4 v) {
    // apply the flip to an element in the lie algebra of SL(2,R)
    return vec4(v.y, v.x, -v.z, 0.);
}

// A point in H2 is reprented by a vec3 corresponding to its coordinate in the hyperboloid model

vec3 H2reduceError(vec3 point) {
    float q = point.x * point.x + point.y * point.y - point.z * point.z;
    return point / sqrt(-q);
}


vec3 H2rotateBy(vec3 point, float alpha) {
    mat3 R = mat3(
    cos(alpha), sin(alpha), 0,
    - sin(alpha), cos(alpha), 0,
    0, 0, 1
    );
    vec3 res = R * point;
    res = H2reduceError(res);
    return res;
}

vec3 H2flip(vec3 point) {
    vec3 res =  vec3(
    -point.y,
    -point.x,
    point.z
    );
    res = H2reduceError(res);
    return res;
}

vec3 H2translateBy(vec3 point, vec4 elt) {
    mat3 aux = SL2toMat3(elt);
    vec3 res = aux * point;
    res = H2reduceError(res);
    return res;
}

vec4 H2toSL2(vec3 point) {
    vec4 res = vec4(
    - point.y / sqrt(2. * point.z + 2.),
    point.x / sqrt(2. * point.z + 2.),
    0,
    sqrt(0.5 + 0.5 * point.z)
    );
    res = SL2reduceError(res);
    return res;
}


// A point in USL(2,R) -- the universal covver of SL(2,R) -- is represented by a vec4
// the first coordinate is the fiber angle
// the last three coordinates are a point in H2 in the hyperboloid model

vec4 USL2rotateBy(vec4 p, float alpha) {
    vec4 res = vec4(
    H2rotateBy(p.xyz, alpha),
    p.w
    );
    return res;
}

vec4 USL2flip(vec4 p){
    vec4 res = vec4(
    H2flip(p.xyz),
    -p.w
    );
    return res;
}

//----------------------------------------------------------------------------------------------------------------------
// STRUCT isometry
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating isometries of the space
  An Isometry is given by
  - an angle `phi`, corresponding to the fiber coordinate
  - a point in H2 `point` corresponding the the projection of the isometry on H2.

  The point is represented as a vec3 using the hyperboloid model of H2
*/

struct Isometry {
    float phi;// fiber coordinate
    vec3 point;// the projection in H2
};


vec4 IsomToSL2(Isometry isom) {
    vec4 res = H2toSL2(isom.point);
    res = SL2translateFiberBy(res, isom.phi);
    return res;
}


Isometry composeIsometry(Isometry isom1, Isometry isom2) {
    vec4 aux1 = IsomToSL2(isom1);
    vec4 aux2 = IsomToSL2(isom2);
    vec3 resPoint = H2translateBy(isom2.point, aux1);
    aux2 = SL2multiply(aux1, aux2);
    aux2 = SL2translateFiberBy(aux2, -isom1.phi - isom2.phi);
    float resPhi = isom1.phi + isom2.phi + atan(aux2.z, aux2.w);
    Isometry res = Isometry(resPhi, resPoint);
    return res;
}

Isometry makeLeftTranslation(vec4 p) {
    return Isometry(p.w, p.xyz);
}

Isometry makeInvLeftTranslation(vec4 p) {
    return Isometry(
    -p.w,
    H2rotateBy(p.xyz, PI - 2. * p.w)
    );
}


vec4 translate(Isometry isom, vec4 p) {
    // translate a point by the given isometry
    Isometry aux = makeLeftTranslation(p);
    aux = composeIsometry(isom, aux);
    vec4 res = vec4(
    aux.point,
    aux.phi
    );
    return res;
}


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


/*
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
*/

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
    float y0 = u.pos.x;
    float y1 = u.pos.y;
    float y2 = u.pos.z;

    mat4 g = mat4(
    2. * (y2 + 1.) * y2, 0., -y0 * (2. * y2 + 1.), -2. * y1 * (y2 + 1.),
    0., 2. * (y2 + 1.) * y2, -y1 * (2. * y2 + 1.), 2. * y0 * (y2 + 1.),
    -y0 * (2. * y2 + 1.), -y1 * (2. * y2 + 1.), 2. * y2 * y2 - 1., 0.,
    -2. * y1 * (y2 + 1.), 2. * y0 * (y2 + 1.), 0., 4. * pow(y2 + 1., 2.)
    );
    g = g / (4. * pow(y2 + 1., 2.));
    return dot(u.dir, g * v.dir);

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
    // given a tangent vector (u0, u1, u2, u3) at (y0, y1, y2, phi) it satisfies
    //  y0 * u0 + y1 * u1 - y2 * u2 = 0 (because of the hyperboloid model of H2)

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
// STRUCT localTangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Another data type for manipulating points in the tangent bundler
  A localTangVector is given by
  - pos : a point in the space.
    The first coordinate is the angle in the fiber
    The last three coordinates are a point in H2 in the hyperboloid model
  - dir: the pull back of the tangent vector by the (unique) element of \tilde SL(2,R) bringing pos to the origin
    The tangent vector is seen as a tangent vector at the origin of SL(2,R). The first coordinates is always 0
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


localTangVector translate(Isometry isom, localTangVector v) {
    // over load to translate a direction
    // WARNING. Only works if isom is an element of tilde SL(2,R) (seen as an isometry)
    // Any more general isometry should also acts on the direction component
    return localTangVector(translate(isom, v.pos), v.dir);
}

localTangVector rotateBy(localTangVector v, float alpha) {
    // rotate the tangent vector (position and direction around the fiber by an angle alpha)
    vec3 point = v.pos.xyz;
    point = H2rotateBy(point, alpha);
    vec4 resPos = vec4(point, v.pos.w);

    mat4 R = mat4(
    cos(alpha), sin(alpha), 0, 0,
    -sin(alpha), cos(alpha), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    vec4 resDir = R * v.dir;
    localTangVector res = localTangVector(resPos, resDir);

    return res;
}

localTangVector flip(localTangVector v) {
    // apply the "flip" to the tangent vector (position and direction)
    vec3 point = v.pos.xyz;
    point = H2flip(point);
    vec4 resPos = vec4(point, -v.pos.w);

    mat4 F = mat4(
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1
    );
    vec4 resDir = F * v.dir;
    localTangVector res = localTangVector(resPos, resDir);

    return res;
}


localTangVector rotateFacing(mat4 A, localTangVector v){
    // apply an isometry to the direction part of the tangent vector
    return localTangVector(v.pos, A * v.dir);
}

//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/
/*
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
*/

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

/*
float cosAng(localTangVector u, localTangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}
*/


//----------------------------------------------------------------------------------------------------------------------
// CONVERSION BETWEEN TANGVECTOR AND LOCALTANGVECTOR
//----------------------------------------------------------------------------------------------------------------------

/*
localTangVector toLocalTangVector(tangVector v) {
    Isometry isom = makeInvLeftTranslation(v.pos);
    localTangVector res = localTangVector(v.pos, translate(isom, v.dir));
    return tangNormalize(res);
}
*/




tangVector toTangVector(localTangVector v) {
    float y0 = v.pos.x;
    float y1 = v.pos.t;
    float y2 = v.pos.z;
    float phi = v.pos.w;

    float aux1 = y0 * cos(2. * phi) + y1 * sin(2. * phi);
    float aux2 = y1 * cos(2. * phi) - y0 * sin(2. * phi);
    mat4 m = mat4(
    -2. * y0 * aux2 / (y2 + 1.) + 2. * sin(2. * phi), -2. * y1 * aux2 / (y2 + 1.) - 2. * cos(2. * phi), -2. * aux2, aux1 / (y2 + 1.),
    2. * y0 * aux1 / (y2 + 1.) + 2. * cos(2. * phi), 2. * y1 * aux1 / (y2 + 1.) + 2. * sin(2. * phi), 2. * aux1, aux2 / (y2 + 1.),
    0., 0., 0., 1.,
    2. * y0, 2. * y1, 2. * y2 + 2., 0.
    );

    tangVector res = tangVector(v.pos, m * v.dir);
    return res;
}


//----------------------------------------------------------------------------------------------------------------------
// GLOBAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods computing ``global'' objects
*/

float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    // Isometry moving back to the origin and conversely
    //Isometry isomInv = makeInvLeftTranslation(p);

    //vec4 qOrigin = translate(isomInv, q);
    //return  sqrt(exp(-2. * qOrigin.z) * qOrigin.x * qOrigin.x +  exp(2. * qOrigin.z) * qOrigin.y * qOrigin.y + qOrigin.z * qOrigin.z);
    return length(q-p);
}

/*
float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}
*/

float fakeDistance(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return fakeDistance(p, q);
}

/*
float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}
*/

float exactDist(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}


tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
    return tangNormalize(tangVector(p, q - p));
}


tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}


tangVector tangDirection(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}



vec4 flowDir(vec4 dir, float t) {
    // compute the direction part of the geodesic flow
    // there is no trichotomy here
    float omegat = 4. * dir.z * t;
    mat4 S = mat4(
    cos(omegat), -sin(omegat), 0, 0,
    sin(omegat), cos(omegat), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    vec4 res = S * dir;
    return res;
}


vec4 flowFromOriginH2Like(vec4 dir, float t) {
    // follow the geodesic flow from the origin during time t in the given direction
    // we assume that the direction  has the following form
    // dir = (0, a1, a2, 0) with
    // * 0 <= a2 < a1
    // return the achieved position
    float a1 = dir.y;
    float a2 = dir.z;
    float phi = 2. * a2 * t;
    float omega = sqrt(a1 * a1 - a2 * a2);
    float ct = cosh(omega * t);
    float st = sinh(omega * t);

    vec3 point = vec3(
    2. * a1 * ct * st / omega,
    - 2. * a1 * a2 * pow(st / omega, 2.),
    1. + 2. * pow(a1 * ct / omega, 2.)
    );
    phi = phi + atan(point.y, point.x);
    vec4 res = vec4(phi, point);
    return res;
}

vec4 flowFromOriginFiberLike(vec4 dir, float t) {
    // follow the geodesic flow from the origin during time t in the given direction
    // we assume that the direction  has the following form
    // dir = (0, a1, a2, 0) with
    // * 0 <= a1 < a2
    // return the achieved position
    float a1 = dir.y;
    float a2 = dir.z;
    float phi = 2. * a2 * t;
    float omega = sqrt(a2 * a2 - a1 * a1);
    float ct = cos(omega * t);
    float st = sin(omega * t);

    vec3 point = vec3(
    2. * a1 * ct * st / omega,
    - 2. * a1 * a2 * pow(st / omega, 2.),
    1. + 2. * pow(a1 * ct / omega, 2.)
    );
    phi = phi + atan(point.y, point.x) + 2. * floor(0.5 - 0.5 * omega * t / PI) * PI;
    vec4 res = vec4(phi, point);
    return res;
}

vec4 flowFromOriginIntermediate(vec4 dir, float t) {
    // follow the geodesic flow from the origin during time t in the given direction
    // we assume that the direction  has the following form
    // dir = (0, a1, a2, 0) with
    // * 0 <= a1 = a2
    // return the achieved position
    // TODO: replace the exact formular with an asymptotic expansion of the other cases around a1 = 1/sqrt(2)
    float a1 = dir.y;
    float a2 = dir.z;
    float phi = 2. * a2 * t;


    vec3 point = vec3(
    sqrt(2.) * t,
    - pow(t, 2.),
    pow(t, 2.) + 1.
    );
    phi = phi + atan(point.y, point.x);
    vec4 res = vec4(phi, point);
    return res;
}

localTangVector flow(localTangVector tv, float t) {
    vec4 aux = tv.dir;
    bool flipped = false;
    if (aux.z < 0.) {
        aux = TSL2flip(aux);
        flipped = true;
    }
    float alpha = atan(aux.y, aux.x) -0.5 * PI;
    aux = vec4(0., sqrt(1. - aux.z * aux.z), aux.z, 0.);

    vec4 posFromOrigin;
    if (aux.z < aux.y) {
        posFromOrigin = flowFromOriginH2Like(aux, t);
    }
    else if (aux.z == aux.y) {
        posFromOrigin = flowFromOriginIntermediate(aux, t);
    }
    else {
        posFromOrigin = flowFromOriginFiberLike(aux, t);
    }

    posFromOrigin = USL2rotateBy(posFromOrigin, alpha);
    if (flipped) {
        posFromOrigin = USL2flip(posFromOrigin);
    }

    Isometry isom = makeLeftTranslation(tv.pos);
    vec4 resPos = translate(isom, posFromOrigin);
    vec4 resDir = flowDir(tv.dir, t);
    localTangVector res = localTangVector(resPos, resDir);
    return res;
}


//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------


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
Isometry identity=Isometry(0., vec3(1., 0., 0.));

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
uniform vec4 invGenerators[6]; //
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


// overload of the previous method with local tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
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
        tangVector tv = tangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);

    }
    else { //local scene
        tangVector tv = tangVector(p,
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


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

//void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
//    Isometry fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = identityIsometry;
//
//
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            localtv = flow(localtv, marchStep);
//
//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                marchStep = MIN_DIST;
//            }
//            else {
//                float localDist = min(5., localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    // hitWhich = 3;
//                    sampletv = localtv;
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
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = flow(tv, marchStep);
//
//            /*
//            if (i == 15) {
//                hitWhich = 5;
//                debugColor = 10000. * vec3(0, 0, marchStep);
//                break;
//            }
//            */
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = tv;
//                //hitWhich = 5;
//                //debugColor = 0.1*vec3(globalDepth, 0, 0);
//                return;
//            }
//            marchStep = globalDist;
//            globalDepth += globalDist;
//            if (globalDepth >= localDepth){
//                //hitWhich = 5;
//                //debugColor = vec3(0, globalDepth, 0);
//                break;
//            }
//        }
//        /*
//        if(hitWhich == 0) {
//            hitWhich = 5;
//            debugColor = 0.1*vec3(0, 0, globalDepth);
//        }
//        */
//    }
//}


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
// done with local vectors

int BINARY_SEARCH_STEPS=4;

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    localTangVector testlocaltv = rayDir;
    localTangVector bestlocaltv = rayDir;
    totalFixMatrix = identity;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){


        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);


            if (localDist < EPSILON){
                sampletv = toTangVector(localtv);
                break;
            }
            marchStep = localDist;

            //localtv = flow(localtv, marchStep);

            //            if (isOutsideCell(localtv, fixMatrix)){
            //                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            //                localtv = translate(fixMatrix, localtv);
            //                localtv=tangNormalize(localtv);
            //                marchStep = MIN_DIST;
            //            }

            testlocaltv = flow(localtv, marchStep);
            if (isOutsideCell(testlocaltv, fixMatrix)){
                bestlocaltv = testlocaltv;

                for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
                    ////// do binary search to get close to but outside this cell -
                    ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
                    testMarchStep = marchStep - pow(0.5, float(j+1))*localDist;
                    testlocaltv = flow(localtv, testMarchStep);
                    if (isOutsideCell(testlocaltv, testFixMatrix)){
                        marchStep = testMarchStep;
                        bestlocaltv = testlocaltv;
                        fixMatrix = testFixMatrix;
                    }
                }

                localtv = bestlocaltv;
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                localtv=tangNormalize(localtv);
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
    else { localDepth=MAX_DIST; }


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
            tv = flow(tv, marchStep);

            /*
            if (i == 15) {
                hitWhich = 5;
                debugColor = 10000. * vec3(0, 0, marchStep);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identity;
                sampletv = toTangVector(tv);
                //hitWhich = 5;
                //debugColor = 0.1*vec3(globalDepth, 0, 0);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(0, globalDepth, 0);
                break;
            }
        }
        /*
        if(hitWhich == 0) {
            hitWhich = 5;
            debugColor = 0.1*vec3(0, 0, globalDepth);
        }
        */
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
    tangVector V = tangVector(SP, -sampletv.dir);

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
        TLP = translate( makeLeftTranslation(invGenerators[i]), localLightPos );
        color+= lightingCalculations(SP, TLP, V, surfColor, localLightColor);
    }

    return color;
}


//EARTH TEXTURING COLOR COMMANDS

// return the two smallest numbers in a triplet
vec2 smallest(in vec3 v)
{
    float mi = min(v.x, min(v.y, v.z));
    float ma = max(v.x, max(v.y, v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi, me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
vec3 boxMapping(in sampler2D sam, in tangVector point)
{ // from Inigo Quilez
    vec4 m = point.dir*point.dir; m=m*m; m=m*m;

    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}


vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    Isometry aux = makeInvLeftTranslation(globalObjectBoostMat);
    pt = translate(aux, pt);
    return tangDirection(ORIGIN, pt).dir.xyz;
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

localTangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2 * ((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1 / tan(radians(fov * 0.5));
    // code specific to SL2 (change the system of coordinates to make it coherent with the other geometries ?)
    localTangVector tv = localTangVector(ORIGIN, vec4(xy, -z, 0.));
    localTangVector v =  tangNormalize(tv);
    return v;
}

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){
    setResolution(res);
    currentBoost = makeLeftTranslation(currentBoostMat);
    leftBoost = makeLeftTranslation(leftBoostMat);
    rightBoost = makeLeftTranslation(rightBoostMat);
    cellBoost = makeLeftTranslation(cellBoostMat);
    invCellBoost = makeLeftTranslation(invCellBoostMat);
    globalObjectBoost = makeLeftTranslation(globalObjectBoostMat);


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    localTangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rayDir = rotateFacing(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir = rotateFacing(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }
    else {
        rayDir = rotateFacing(facing, rayDir);
        rayDir = translate(currentBoost, rayDir);
    }

    //get our raymarched distance back ------------------------
    Isometry totalFixMatrix = identity;
    // do the marching
    //raymarch(rayDir, totalFixMatrix);
    raymarch(rayDir, totalFixMatrix);

    /*
    hitWhich = 5;

    float aux = ellipj(0.0001 * time * ell_K).x;
    if (aux > 0.){
        debugColor = vec3(aux, 0, 0);
    }
    else {
        debugColor = vec3(0, -aux, 0);
    }
    */


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.3);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        return;
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich==3) {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

}