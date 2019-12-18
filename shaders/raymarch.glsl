#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

const bool FAKE_LIGHT = true;
const bool SURFACE_COLOR=true;
const bool FAKE_DIST_SPHERE = false;
const float globalObjectRadius = 0.;
const bool LOCAL_EARTH=true;
const bool TILING=false;

//local lights only on without the tiling: they help with definition on the earth but wash out the tiling
const bool LOCAL_LIGHTS=!TILING;
//bool hitLocal;
//--------------------------------------------
// "TRUE" CONSTANTS
//--------------------------------------------

const float PI = 3.1415926538;

const vec4 ORIGIN = vec4(0, 0, 0, 1);
const float modelHalfCube = 0.5;


/*
//generated in JS using translateByVector(new THREE.Vector3(-c_ipDist,0,0));
const mat4 leftBoost = mat4(1., 0, 0, -0.032,
0, 1, 0, 0,
0, 0, 1, 0,
-0.032, 0, 0, 1.);

//generated in JS using translateByVector(new THREE.Vector3(c_ipDist,0,0));
const mat4 rightBoost = mat4(1., 0, 0, 0.032,
0, 1, 0, 0,
0, 0, 1, 0,
0.032, 0, 0, 1.);
*/


vec3 debugColor = vec3(0.5, 0, 0.8);

//--------------------------------------------
// AUXILIARY (BASICS)
//--------------------------------------------

/*
Some auxiliary methods
*/


// According to the doc, atan is not defined whenever x = 0
// We fix this here
float fixedatan(float y, float x) {
    if (x == 0. && y == 0.) {
        return 0.0;
    }
    else if (x == 0.) {
        if (y > 0.0) {
            return 0.5* PI;
        }
        else {
            return -0.5*PI;
        }
    }
    else {
        return atan(y, x);
    }
}


//-------------------------------------------------------
// AUXILIARY (NEWTON METHOD)
//-------------------------------------------------------

/*

Compute the zeros between 0 and 2*PI of the function f given below
Usefull for the methods
- tangDirection
- exactDistance

*/

const int MAX_NEWTON_INIT_ITERATION = 1000;
const int MAX_NEWTON_ITERATION = 1000;
const float MAX_NEWTON_INIT_TOLERANCE = 0.001;
const float NEWTON_TOLERANCE = 0.0001;


// the function f whose zeros need to be found
float f(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return rhosq * (phi - sin(phi)) - 8.0 * (x3 - phi) * pow(sin(0.5 * phi), 2.0);
}

// the derivative of f (with respect to phi)
float df(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return 2.0 * sin(0.5 * phi) * (rhosq + 4.0) * sin(0.5 * phi) - 4.0 * (x3 -phi) * cos(0.5 * phi);
}

// the second derivative of f (with respect to phi)
float d2f(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return (rhosq + 8.0) * sin(phi) - 4.0 * (x3 - phi) * cos(phi);
}

// rough zero, to start newton method (with a check on convexity)
float newton_init(float rhosq, float x3) {
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates

    if (x3 < PI) {
        // if x3 < pi, x3 is a good start for the Newthon method
        return x3;
    }
    else {
        // if x3 > pi, do a dichotomy to find the best start
        float phi0 = 0.0;
        float d20 = d2f(rhosq, x3, phi0);
        float phi1 = min(2.0 * PI, x3);
        float d21 = d2f(rhosq, x3, phi1);

        for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++) {
            // step of the dichotomy
            float phi_aux = 0.5 * phi0 + 0.5 * phi1;
            float val = f(rhosq, x3, phi_aux);
            float d2_aux = d2f(rhosq, x3, phi_aux);
            if (val < 0.0) {
                phi0 = phi_aux;
                d20 = d2_aux;
            }
            else {
                phi1 = phi_aux;
                d21 = d2_aux;
            }
            // stop test
            if ((phi1 - phi0) < 0.1 &&  d20 * d21 > 0.0){
                break;
            }
        }
        // the starting value depends on the concavity of the map f
        if (d20 > 0.0) {
            return phi1;
        }
        else {
            return phi0;
        }
    }
}

// newton's method for finding the zeros of f
float newton_zero(float rhosq, float x3) {
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates

    float phi = newton_init(rhosq, x3);
    float val = f(rhosq, x3, phi);
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        if (abs(val) < NEWTON_TOLERANCE){
            return phi;
        }
        phi = phi - val/df(rhosq, x3, phi);
        val = f(rhosq, x3, phi);
    }
    return phi;
}


//--------------------------------------------
// STRUCT tangVector
//--------------------------------------------

/*
  Data type for manipulating points in the tangent bundler
  A tangVector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Implement various basic methods to manipulate them
*/

struct tangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


//--------------------------------------------
// LOCAL GEOMETRY
//--------------------------------------------

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

tangVector translate(mat4 isom, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(isom * v.pos, isom * v.dir);
}

tangVector applyMatrixToDir(mat4 matrix, tangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return tangVector(v.pos, matrix* v.dir);
}

float tangDot(tangVector u, tangVector v){
    // dot product between two vectors in the tangent bundle
    // we assume that the underlying points are the same
    // TODO : make a test if the underlying points are indeed the same ?
    vec4 p = u.pos;
    mat3 g = mat3(
    0.25 * pow(p.y, 2.) +1., -0.25 * p.x * p.y, 0.5 * p.y,
    -0.25 * p.x * p.y, 0.25 * pow(p.x, 2.)+1., -0.5 * p.x,
    0.5 * p.y, -0.5 * p.x, 1.
    );

    return dot(u.dir.xyz, g * v.dir.xyz);
}

float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(abs(tangDot(v, v)));
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

    /*
    vec4 basis_x = tangNormalize(p, vec4(p.w, 0.0, 0.0, p.x));
    vec4 basis_y = vec4(0.0, p.w, 0.0, p.y);
    vec4 basis_z = vec4(0.0, 0.0, p.w, p.z);
    //make this orthonormal
    basis_y = tangNormalize(p, basis_y - cosAng(p, basis_y, basis_x)*basis_x);// need to Gram Schmidt
    basis_z = tangNormalize(p, basis_z - cosAng(p, basis_z, basis_x)*basis_x - cosAng(p, basis_z, basis_y)*basis_y);
    mat4 theBasis=mat4(0.);
    */

    vec4 basis_x = vec4(1., 0., 0., 0.);
    vec4 basis_y = vec4(0., 1., 0., 0.);
    vec4 basis_z = vec4(0., 0., 1., 0.);
    mat4 theBasis=mat4(0.);
    theBasis[0]=basis_x;
    theBasis[1]=basis_y;
    theBasis[2]=basis_z;
    return theBasis;
}


//--------------------------------------------
// GLOBAL GEOMETRY
//--------------------------------------------

/*
  Methods computing ``global'' objects
*/


mat4 nilMatrix(vec4 p) {
    // return the Heisenberg isometry sending the origin to p
    // this is in COLUMN MAJOR ORDER so the things that LOOK LIKE ROWS are actually FUCKING COLUMNS!
    return mat4(
    1., 0., -p.y/2., 0.,
    0., 1., p.x/2., 0.,
    0., 0., 1., 0.,
    p.x, p.y, p.z, 1.);
}

mat4 nilMatrixInv(vec4 p) {
    // return the Heisenberg isometry sending the p to origin
    return mat4(
    1., 0., p.y/2., 0.,
    0., 1., -p.x/2., 0.,
    0., 0., 1., 0.,
    -p.x, -p.y, -p.z, 1.);
}

float fakeHeightSq(float z) {
    // square of the fake height.
    // fake height : bound on the height of the ball centered at the origin passing through p
    // (whose z coordinate is the argument)

    if (z < sqrt(6.)){
        return z * z;
    }
    else if (z < 4.*sqrt(3.)){
        return 12. * (pow(0.75 * z, 2. / 3.) - 1.);
    }
    else {
        return 2. * sqrt(3.) * z;
    }
}


float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv*q;
    // we now need the distance between the origin and p
    float rhosq = pow(qOrigin.x, 2.)+pow(qOrigin.y, 2.);
    float hsq = fakeHeightSq(qOrigin.z);

    return pow(0.2*pow(rhosq, 2.) + 0.8*pow(hsq, 2.), 0.25);
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv * q;

    // solve the problem !
    float x3 = qOrigin.z;
    float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);

    if (x3 == 0.0) {
        return sqrt(rhosq);
    }
    else {
        float phi = newton_zero(rhosq, x3);
        float sign = 0.0;
        if (x3 > 0.0) {
            sign = 1.0;
        }
        else {
            sign = -1.0;
        }
        float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
        return abs(phi/w);
    }
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).

    if (FAKE_LIGHT) {
        // if FAKE_LIGHT is ON, just return the Euclidean vector pointing to q
        return tangVector(p, normalize(q-p));
    }

    else {
        // move p to the origin
        mat4 isom = nilMatrix(p);
        mat4 isomInv = nilMatrixInv(p);

        vec4 qOrigin = isomInv*q;

        // solve the problem !
        float x3 = qOrigin.z;

        vec4 resOrigin = vec4(0.);
        if (x3 == 0.0) {
            // probably not needed (case contained in the next one)
            resOrigin =  vec4(qOrigin.z, qOrigin.y, qOrigin.z, 0.0);
        }
        else {
            float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
            float phi = newton_zero(rhosq, x3);
            float sign = 0.0;
            if (x3 > 0.0) {
                sign = 1.0;
            }
            else {
                sign = -1.0;
            }
            float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
            float c = sqrt(1.0  - pow(w, 2.0));
            float alpha = - 0.5 * phi;
            if (qOrigin.x*qOrigin.y != 0.0){
                alpha = alpha + atan(qOrigin.y, qOrigin.x);
            }
            //float t = phi / w;

            //resOrigin =  t * vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
            resOrigin =  vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
        }

        // move back to p
        return tangVector(p, isom * resOrigin);
    }
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}

tangVector flow(tangVector tv, float t){
    // Follow the geodesic flow during a time t
    // If the tangent vector at the origin is too close to the XY plane,
    // we use an asymptotic expansion of the geodesics.
    // This help to get rid of the noise around the XY plane
    // The threshold is given by the tolerance parameter
    float tolerance = 0.1;


    // move p to the origin
    mat4 isom = nilMatrix(tv.pos);
    mat4 isomInv = nilMatrixInv(tv.pos);

    // vector at the origin
    tangVector tvOrigin = translate(isomInv, tv);

    // solve the problem !
    float w = tvOrigin.dir.z;
    float c = sqrt(1. - w * w);
    float alpha = fixedatan(tvOrigin.dir.y, tvOrigin.dir.x);

    tangVector achievedFromOrigin = tangVector(ORIGIN, vec4(0.));

    /*
         TODO. question : the threshold should be  |w| << 1 or |wt| << 1 ?
    */


    if (abs(w * t) < tolerance){
        // use an asymptotic expansion (computed with SageMath

        // factorize some computations...
        float cosa = cos(alpha);
        float sina = sin(alpha);
        float t1 = t;
        float t2 = t1 * t;
        float t3 = t2 * t;
        float t4 = t3 * t;
        float t5 = t4 * t;
        float t6 = t5 * t;
        float t7 = t6 * t;
        float t8 = t7 * t;
        float t9 = t8 * t;

        float w1 = w;
        float w2 = w1 * w;
        float w3 = w2 * w;
        float w4 = w3 * w;
        float w5 = w4 * w;
        float w6 = w5 * w;
        float w7 = w6 * w;



        achievedFromOrigin.pos = vec4(
        c * t1 * cosa
        - (1. / 2.) * c * t2 * w1 * sina
        - (1. / 6.) * c * t3 * w2 * cosa
        + (1. / 24.) * c * t4 * w3 * sina
        + (1. / 120.) * c * t5 * w4 * cosa
        - (1. / 720.) * c * t6 * w5 * sina
        - (1. / 5040.) * c * t7 * w6 * cosa
        + (1. / 40320.) * c * t8 * w7 * sina,

        c * t * sina
        + (1. / 2.) * c * t2 * w1 * cosa
        - (1. / 6.) * c * t3 * w2 * sina
        - (1. / 24.) * c * t4 * w3 * cosa
        + (1. / 120.) * c * t5 * w4 * sina
        + (1. / 720.) * c * t6 * w5 * cosa
        - (1. / 5040.) * c * t7 * w6 * sina
        - (1. / 40320.) * c * t8 * w7 * cosa,

        (1. / 12.) * (c * c * t3 + 12. * t1) * w1
        - (1. / 240.) * c * c * t5 * w3
        + (1. / 10080.) * c * c * t7 * w5
        - (1. / 725760.) * c * c * t9 * w7,

        1);
        achievedFromOrigin.dir =  vec4(
        c * cosa
        - c * t1 * w1 * sina
        - (1. / 2.) * c * t2 * w2 * cosa
        + (1. / 6.) * c * t3 * w3 * sina
        + (1. / 24.) * c * t4 * w4 * cosa
        - (1. / 120.) * c * t5 * w5 * sina
        - (1. / 720.) * c * t6 * t6 * cosa
        + (1. / 5040.) * c * t7 * w7 * sina,

        c * sina
        + c * t1 * w1 * cosa
        - (1. / 2.) * c * t2 * w2 * sina
        - (1. / 6.) * c * t3 * w3 * cosa
        + (1. / 24.) * c * t4 * w4 * sina
        + (1. / 120.) * c * t5 * w5 * cosa
        - (1. / 720.) * c * t6 * t6 * sina
        - (1. / 5040.) * c * t7 * w7 * cosa,

        (1. / 4.) * (c * c * t2 + 4.) * w1
        - (1. / 48.) * c * c * t4 * w3
        + (1. / 1440.) * c * c * t6 * w5
        - (1. / 8060.) * c * c * t8 * w7,

        0
        );
    }

    /*
        For the record, the previous test without the asymptotic expansion

        if (w == 0.) {

            achievedFromOrigin.pos = vec4(c * cos(alpha) * t, c * sin(alpha) * t, 0. , 1.);
            achievedFromOrigin.dir = tvOrigin.dir;
    }
    */

    else {
        achievedFromOrigin.pos = vec4(
        2. * (c / w) * sin(0.5 * w * t) * cos(0.5 * w * t + alpha),
        2. * (c / w) * sin(0.5 * w * t) * sin(0.5 * w * t + alpha),
        w * t + 0.5 * pow(c / w, 2.) * (w * t - sin(w * t)),
        1.
        );

        achievedFromOrigin.dir = vec4(
        c * cos(w * t + alpha),
        c * sin(w * t + alpha),
        w + 0.5 * pow(c, 2.) / w  - 0.5 * pow(c, 2.) * cos(w * t) / w,
        0.
        );
    }

    // move back to p
    tangVector res = translate(isom, achievedFromOrigin);
    return res;
}


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------


//Project onto the Klein Model
vec4 modelProject(vec4 u){
    return u;
}


//--------------------------------------------
//Geometry of Space
//--------------------------------------------

//project point back onto the geometry
vec4 geomNormalize(vec4 u){
    return u;
}


//-------------------------------------------------------
// LIGHT
//-------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    //fake linear falloff
    return dist;

}


//---------------------------------------------------------------------
//Raymarch Primitives
//---------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    // more precise computation
    float fakeDist = fakeDistance(p, center);

    if (FAKE_DIST_SPHERE) {
        return fakeDist - radius;
    }
    else {
        if (fakeDist > 10. * radius) {
            return fakeDist - radius;
        }
        else {
            return exactDist(p, center) - radius;
        }
    }
}


float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


//--------------------------------------------
//Global Constants
//--------------------------------------------
const int MAX_MARCHING_STEPS =  100;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
const float fov = 120.0;
const float sqrt3 = 1.7320508075688772;


//--------------------------------------------
//Global Variables
//--------------------------------------------
tangVector N = tangVector(ORIGIN, vec4(0., 0., 0., 1.));//normal vector
tangVector sampletv = tangVector(vec4(1., 1., 1., 1.), vec4(1., 1., 1., 0.));
vec4 globalLightColor = vec4(1.,1.,1.,1.);
int hitWhich = 0;

vec3 localLightColor=vec3(1.,1.,1.);
vec4 localLightPos=vec4(-0.2,0.2,-0.1,1.);
float localLightIntensity=0.3;
//-------------------------------------------
//Translation & Utility Variables
//--------------------------------------------
uniform int isStereo;
uniform vec2 screenResolution;
uniform mat4 invGenerators[6];
uniform mat4 currentBoost;
uniform mat4 leftBoost;
uniform mat4 rightBoost;
uniform mat4 facing;
uniform mat4 leftFacing;
uniform mat4 rightFacing;
uniform mat4 cellBoost;
uniform mat4 invCellBoost;
uniform samplerCube earthCubeTex;
//--------------------------------------------
// Lighting Variables & Global Object Variables
//--------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoost;
uniform mat4 localEarthBoost;

//---------------------------------------------------------------------
// Scene Definitions
//---------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

// LOCAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
//float localSceneSDF(vec4 p){
//    vec4 center = vec4(0, 0, 0., 1.);
//    float sphere = centerSDF(p, ORIGIN, 0.68);
//    float final = -sphere;
//    return final;
//}


float localSceneSDF(vec4 p){
    float earthDist;
    float tilingDist;
    float lightDist;
    float distance = MAX_DIST;
    
     if(LOCAL_LIGHTS){
     vec4 lightCenter=localLightPos;
      lightDist=sphereSDF(p,lightCenter,0.05);
      distance =min(distance, lightDist);
        if (lightDist < EPSILON){
           // hitLocal = true;
            hitWhich = 1;
            globalLightColor =vec4(localLightColor,1);
            return lightDist;
        }
 }
    

    
    if(LOCAL_EARTH){
       vec4 earthCenter=localEarthBoost*ORIGIN;
       earthDist=sphereSDF(p,earthCenter,0.15);
        distance=min(distance,earthDist);
        if(earthDist < EPSILON){
           // hitLocal = true;
            hitWhich = 7;
            return earthDist;
        }  
    }
 if(TILING){
    tilingDist = -sphereSDF(p, ORIGIN, 0.68);
     distance=min(distance, tilingDist);
        if(tilingDist < EPSILON){
           // hitLocal = true;
            hitWhich=3;
            return tilingDist;
        }
 }
    return distance;
}
   

//earth scene

//float localSceneSDF(vec4 p){
//    float sphere=MAX_DIST;
//    if(LOCAL_EARTH){
//    vec4 earthCenter = 
//    sphere = sphereSDF(p, earthCenter, 0.1);
//    }
//    
//    
//
//    return min(sphere,tiling);
//}


// GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    vec4 absolutep = cellBoost * p;// correct for the fact that we have been moving
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        1.0/(10.0*lightIntensities[i].w)
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    //Global Sphere Object
    float objDist;
    objDist = sphereSDF(absolutep, globalObjectBoost[3], globalObjectRadius);
    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
    }
    return distance;
}


bool isOutsideCell(vec4 p, out mat4 fixMatrix){
    // check if the given point p is in the fundamental domain of the lattice.
    if (p.x > modelHalfCube){
        fixMatrix = invGenerators[0];
        return true;
    }
    if (p.x < -modelHalfCube){
        fixMatrix = invGenerators[1];
        return true;
    }
    if (p.y > modelHalfCube){
        fixMatrix = invGenerators[2];
        return true;
    }
    if (p.y < -modelHalfCube){
        fixMatrix = invGenerators[3];
        return true;
    }
    if (p.z > modelHalfCube){
        fixMatrix = invGenerators[4];
        return true;
    }
    if (p.z < -modelHalfCube){
        fixMatrix = invGenerators[5];
        return true;
    }
    return false;
}

bool isOutsideCell(tangVector v, out mat4 fixMatrix){
    // overload of the previous method with tangent vector
    return isOutsideCell(v.pos, fixMatrix);
}


//--------------------------------------------
// GEOM DEPENDENT
//--------------------------------------------


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


//--------------------------------------------
// NOT GEOM DEPENDENT
//--------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        localtv = flow(localtv, marchStep);
//
//        if (isOutsideCell(localtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localtv);
//            marchStep = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localtv;
//                break;
//            }
//            marchStep = localDist;
//            globalDepth += localDist;
//        }
//    }
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    // localDepth= MAX_DIST;
//    globalDepth = MIN_DIST;
//    marchStep = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tv = flow(tv, marchStep);
//
//        float globalDist = globalSceneSDF(tv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = tv;
//            return;
//        }
//        marchStep = globalDist;
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}


int BINARY_SEARCH_STEPS=4;

//another variation on raymarch (This one adapted from the dynamHyp code that Steve and Henry wrote, where we make sure that we never teleport TOO far past a wall)


void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    mat4 testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
   
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    tangVector testlocaltv = rayDir;
    tangVector bestlocaltv = rayDir;
    totalFixMatrix = mat4(1.);


    // Trace the local scene, then the global scene:

   
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        
      float localDist = localSceneSDF(localtv.pos);
      if (localDist < EPSILON){
          sampletv = localtv;
          break;
      }
      marchStep = localDist;
       
      testlocaltv = flow(localtv, marchStep);
      if (isOutsideCell(testlocaltv, fixMatrix)){
        bestlocaltv = testlocaltv;
          
          
          //commenting out this for loop brings us back to what we were doing before...
        for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
          ////// do binary search to get close to but outside this cell - 
          ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
          testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
          testlocaltv = flow(localtv, testMarchStep);
          if ( isOutsideCell(testlocaltv, testFixMatrix) ){
            marchStep = testMarchStep;
            bestlocaltv = testlocaltv;
            fixMatrix = testFixMatrix;
          }
        }
        localtv = bestlocaltv;
        totalFixMatrix = fixMatrix*totalFixMatrix;
        localtv = translate(fixMatrix, localtv);
        globalDepth += marchStep; 
        marchStep = MIN_DIST;
      }
        
      else{ 
          localtv = testlocaltv; 
          globalDepth += marchStep; 
        }
      }
    
      localDepth=min(globalDepth, MAX_DIST);
    
  
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = flow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
        if (globalDist < EPSILON){
            totalFixMatrix = mat4(1.);
            sampletv = tv;
            return;
        }
        marchStep = globalDist;
        globalDepth += globalDist;
        if (globalDepth >= localDepth){
            break;
        }
      }
    
}





//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector localEndtv = flow(localtv, localDepth);
//
//        if (isOutsideCell(localEndtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localEndtv);
//            localDepth = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localEndtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localEndtv;
//                break;
//            }
//            localDepth += localDist;
//            globalDepth += localDist;
//        }
//    }
//
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    globalDepth = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector globalEndtv = flow(tv, globalDepth);
//
//        float globalDist = globalSceneSDF(globalEndtv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = globalEndtv;
//            return;
//        }
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}


//--------------------------------------------------------------------
// Lighting Functions
//--------------------------------------------------------------------
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
    //Attenuation - Inverse Square
    float distToLight = fakeDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
    //Compute final color
    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(mat4 totalFixMatrix, vec3 color){
    vec4 SP = sampletv.pos;
    vec4 TLP;//translated light position
    tangVector V = tangVector(SP, -sampletv.dir);
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    for (int i = 0; i<4; i++){
        TLP = totalFixMatrix*invCellBoost*lightPositions[i];
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    
    if(LOCAL_LIGHTS){
    //pick up light from the light source in your fundamental domain
  
       color+= lightingCalculations(SP,localLightPos,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
    
    
    //move local light around by the generators to pick up lighting from nearby cells
    for(int i=0; i<6; i++){
        mat4 localLightIsom=invGenerators[i];
        TLP=localLightIsom*localLightPos;
        color+= lightingCalculations(SP,TLP,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
    }
    

}
    
    return color;
}




vec3 localColor(mat4 totalFixMatrix, tangVector sampletv){
    N = estimateNormal(sampletv.pos);
    vec3 color=vec3(0., 0., 0.);
    color = phongModel(totalFixMatrix, color);
    color = 0.9*color+0.1;
    return color;
    //generically gray object (color= black, glowing slightly because of the 0.1)
}


vec3 globalColor(mat4 totalFixMatrix, tangVector sampletv){
    if (SURFACE_COLOR){ //color the object based on its position in the cube
        vec4 samplePos=modelProject(sampletv.pos);
        //Point in the Klein Model unit cube    
        float x=samplePos.x;
        float y=samplePos.y;
        float z=samplePos.z;
        x = 0.9*x/modelHalfCube;
        y = 0.9*y/modelHalfCube;
        z = 0.9*z/modelHalfCube;
        vec3 color = vec3(x, y, z);
        N = estimateNormal(sampletv.pos);
        color = phongModel(totalFixMatrix, 0.1*color);
        return 0.9*color+0.1;
        //adding a small constant makes it glow slightly
    }
    else {
        // objects
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        return color;
    }
}






//EARTH TEXTURING COLOR COMMANDS


// return the two smallest numbers in a triplet
vec2 smallest( in vec3 v )
{
    float mi = min(v.x,min(v.y,v.z));
    float ma = max(v.x,max(v.y,v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi,me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
vec3 boxMapping( in sampler2D sam, in tangVector point )
{  // from Inigo Quilez
    vec4 m = point.dir*point.dir; m=m*m; m=m*m;

    vec3 x = texture( sam, smallest(point.pos.yzw) ).xyz;
    vec3 y = texture( sam, smallest(point.pos.zwx) ).xyz;
    vec3 z = texture( sam, smallest(point.pos.wxy) ).xyz;
    vec3 w = texture( sam, smallest(point.pos.xyz) ).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

vec3 sphereOffset(vec4 pt){
   
    pt = inverse(localEarthBoost)*pt;
    tangVector earthPoint=tangDirection(ORIGIN,pt);
    //earthPoint=rotateFacing(objectFacing, earthPoint);
    return earthPoint.dir.xyz;
}

vec3 sphereTexture(mat4 totalFixMatrix, tangVector sampletv, samplerCube sphTexture){
    
    // vec3 color = vec3(0.5,0.5,0.5);
    vec3 color = texture(sphTexture, sphereOffset( sampletv.pos)).xyz;
    // color = 0.5*color + 0.5*vec3(float(stepsTaken)*0.1, float(stepsTaken-10)*0.1, float(stepsTaken-20)*0.1);
    // N = estimateNormal(sampletv.pos);
     vec3 color2 = phongModel(totalFixMatrix, color);
    color = 0.9*color+0.1;
     return 0.2*color + 0.8*color2;
    return color;
    }


//--------------------------------------------------------------------
// Tangent Space Functions
//--------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    tangVector tv = tangVector(ORIGIN, vec4(xy, -z, 0.0));
    tangVector v =  tangNormalize(tv);
    return v;
}

//--------------------------------------------------------------------
// Main
//--------------------------------------------------------------------

void main(){
    //vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    //camera position must be translated in hyperboloid -----------------------
    rayDir=applyMatrixToDir(facing, rayDir);


    if (isStereo == 1){


        if (isLeft){
            rayDir=applyMatrixToDir(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir=applyMatrixToDir(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }


    // in other geometries, the facing will not be an isom, so applying facing is probably not good.
    // rayDir = translate(facing, rayDir);
    rayDir = translate(currentBoost, rayDir);
    //generate direction then transform to hyperboloid ------------------------

    //    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    mat4 totalFixMatrix = mat4(1.0);
    raymarch(rayDir, totalFixMatrix);

    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.05);
        return;
    }
    else if (hitWhich == 1){ // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){ //debug
        out_FragColor = vec4(debugColor, 1.0);
    }

    else if (hitWhich == 2){ // global object

        vec3 pixelColor=localColor(totalFixMatrix, sampletv);

        out_FragColor = vec4(pixelColor, 1.0);

        return;
    }
    else if (hitWhich == 7){ // the LOCAL earth
        
    //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
   // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=sphereTexture(
            totalFixMatrix, sampletv, earthCubeTex);

       out_FragColor = vec4( pixelColor,1.0);

        return;
    }

    else { // objects

        vec3 pixelColor= globalColor(totalFixMatrix, sampletv);

        out_FragColor=vec4(pixelColor, 1.0);

    }

}