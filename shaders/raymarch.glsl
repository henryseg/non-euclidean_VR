#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

//determine what we draw: ball and lights, 
const bool GLOBAL_SCENE=false;
const bool TILING_SCENE=true;
const bool EARTH=false;


const bool FAKE_LIGHT_FALLOFF=true;
const bool FAKE_LIGHT = true;
const bool FAKE_DIST_SPHERE = false;


//const float globalObjectRadius = 0.4;
const float centerSphereRadius =0.67;
const float vertexSphereSize = 0.23;//In this case its a horosphere

//--------------------------------------------
// "TRUE" CONSTANTS
//----- ---------------------------------------

const float PI = 3.1415926538;
const float GoldenRatio = 0.5*(1.+sqrt(5.));//1.618033988749895;
const float z0 = 0.9624236501192069;// 2 * ln( golden ratio)
const float sqrt3 = 1.7320508075688772;

const vec4 ORIGIN = vec4(0, 0, 0, 1);
const float modelHalfCube =  0.5;//projection of cube to klein model
const vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);//corner of cube in Klein model, useful for horosphere distance function


vec3 debugColor = vec3(0.5, 0, 0.8);

//--------------------------------------------
// AUXILIARY (BASICS)
//--------------------------------------------

const float EULER_STEP = 0.01;


//--------------------------------------------
// STRUCT isometry
//--------------------------------------------

/*
  Data type for manipulating isometries of the space
  A tangVector is given by
  - matrix : a 4x4 matrix
*/

struct Isometry {
    mat4 matrix;// isometry of the space
};

/*

Global symmetries of the space
Used to reduce the lookup table

*/

// reflection accros the x = 0 plane
const Isometry refX = Isometry(mat4(
-1., 0., 0., 0.,
0., 1., 0., 0.,
0., 0., 1., 0.,
0., 0., 0., 1.
));

// reflection accros the y = 0 plane
const Isometry refY = Isometry(mat4(
1., 0., 0., 0.,
0., -1., 0., 0.,
0., 0., 1., 0.,
0., 0., 0., 1.
));

// pi-rotation around the axis z = 0 ; x = y
const Isometry rotXY = Isometry(mat4(
0., 1., 0., 0.,
1., 0., 0., 0.,
0., 0., -1., 0.,
0., 0., 0., 1.
));

const Isometry identity = Isometry(mat4(1.0));

Isometry composeIsometry(Isometry A, Isometry B)
{
    return Isometry(A.matrix*B.matrix);
}


Isometry makeLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    exp(p.z), 0., 0., 0.,
    0., exp(-p.z), 0., 0.,
    0., 0., 1., 0,
    p.x, p.y, p.z, 1.
    );
    return Isometry(matrix);
}

Isometry makeInvLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    exp(-p.z), 0., 0., 0.,
    0., exp(p.z), 0., 0.,
    0., 0., 1., 0,
    -exp(-p.z) * p.x, -exp(p.z) * p.y, -p.z, 1.
    );
    return Isometry(matrix);
}

/*

Isometry makeLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    1., 0., 0., 0.,
    0., 1., 0., 0.,
    0., 0., 1., 0,
    p.x, p.y, p.z, 1.
    );
    return Isometry(matrix);
}

Isometry makeInvLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    1., 0., 0., 0.,
    0., 1., 0., 0.,
    0., 0., 1., 0,
    -p.x, -p.y, -p.z, 1.
    );
    return Isometry(matrix);
}
*/

vec4 translate(Isometry A, vec4 v) {
    // translate a point of a vector by the given direction
    return A.matrix * v;
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


struct localTangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// pull back at the origin of the tangent vector by the "pure translation" moving the origin to pos
};

//--------------------------------------------
// Applying Isometries, Facings
//--------------------------------------------

Isometry makeLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}

Isometry makeLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}

Isometry makeInvLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}

Isometry makeInvLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}

tangVector translate(Isometry A, tangVector v) {
    // over load to translate a direction
    return tangVector(A.matrix * v.pos, A.matrix * v.dir);
}

localTangVector translate(Isometry A, localTangVector v) {
    // over load to translate a direction
    return localTangVector(A.matrix * v.pos, v.dir);
}

tangVector rotateFacing(mat4 A, tangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(v.pos, A*v.dir);
}

localTangVector rotateFacing(mat4 A, localTangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return localTangVector(v.pos, A*v.dir);
}

//--------------------------------------------
// CONVERSION between two representations of tangent vectors
//--------------------------------------------


tangVector toTangVector(localTangVector v) {
    // convert a local tangent vector to a tangent vector
    Isometry isom = makeLeftTranslation(v.pos);
    vec4 newDir = translate(isom, v.dir);
    return tangVector(v.pos, newDir);
}

localTangVector toLocalTangVector(tangVector v) {
    // convert a tangent vector to a local tangent vector
    Isometry isom = makeInvLeftTranslation(v.pos);
    vec4 newDir = translate(isom, v.dir);
    return localTangVector(v.pos, newDir);
}


/*

    Conversion functions used by the various textures

*/

vec4 car2sph(vec4 v) {
    // convert a vector with (x,y,z,0) cartesian coordinates to a vector with (r,theta,phi, 0) spherical coordinates
    float r = length(v.xyz);
    float theta = atan(v.y, v.x);
    float phi = atan(length(v.xy), v.z);
    return vec4(r, theta, phi, 0.);
}

vec4 sph2car(vec4 v) {
    // convert a vector with (r,theta,phi, 0) spherical coordinates to a vector with (x,y,z,0) cartesian coordinates
    float r = v.x;
    float theta = v.y;
    float phi = v.z;
    return vec4(r * cos(theta) * sin(phi), r * sin(theta) * sin(phi), r * cos(phi), 0.);
}

/*

    Let P_r be the plane in R^3 of all points (x,y,z) such that x + y + z = r
    We now describe a few maps to project the positive quadrant of the sphere onto P_1
    We choose for a basis of P_0 (the underlying linear space of the affine space P_1) the vector
    - u1 = (-1, 1, 0)
    - u2  = (-1/2, -1/2, 1)
    The origin will be a the point Q = (1, 0, 0)
    The image of the positive quadrant is entirely contained in the rectangle described by the points of the form
    M = Q + s1 * u1 + s2 * u2
    where  s1, s2 in [0,1]
    In practice we will consider the point of the above form with s1, s2 in [- epsilon , 1+ epsilon]
    This should avoid some discontinuity due to a lack of linearization in the texture at the boundary.

*/

vec4 radProj(vec4 u) {
    // The function maps R^3 - P_0 onto P_1
    // More precisely, in M is a point in R^3 - P_0, then the method return the intersection point of (OM) with P_1
    // The vector u is though at (x,y,z,0)
    float s = u.x + u.y + u.z;
    return u / s;
}

vec2 pToLocal(vec4 u) {
    // Given a point M = (x,y,z) in P_1 (i.e. such that x + y + z = 1)
    // return the coordinate of M in the frame (Q, u1, u2), i.e. the scalar s1, s2 such that
    // M = Q + s1 * u1 + s2 * u2
    // The vector u is though at (x,y,z,0)
    return vec2(u.y + 0.5 * u.z, u.z);
}

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

localTangVector add(localTangVector v1, localTangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir + v2.dir);
}

tangVector sub(tangVector v1, tangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir - v2.dir);
}

localTangVector sub(localTangVector v1, localTangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir - v2.dir);
}

tangVector scalarMult(float a, tangVector v) {
    // scalar multiplication of a tangent vector
    return tangVector(v.pos, a * v.dir);
}

localTangVector scalarMult(float a, localTangVector v) {
    // scalar multiplication of a tangent vector
    return localTangVector(v.pos, a * v.dir);
}

tangVector translate(mat4 isom, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(isom * v.pos, isom * v.dir);
}

tangVector translate(mat4 isom, localTangVector v) {
    // apply an isometry to the local tangent vector
    // WARNING : the isometry has to be a element of a "pure" translation
    // (otherwise the isometry -- e.g. an element fixing the origin -- should also affect the direction)
    return tangVector(isom * v.pos, v.dir);
}

tangVector applyMatrixToDir(mat4 matrix, tangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return tangVector(v.pos, matrix * v.dir);
}

localTangVector applyMatrixToDir(mat4 matrix, localTangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return localTangVector(v.pos, matrix * v.dir);
}


float tangDot(tangVector u, tangVector v){
    mat3 g = mat3(
    exp(-2. * u.pos.z), 0., 0.,
    0., exp(2. * u.pos.z), 0.,
    0., 0., 1.
    );
    return dot(u.dir.xyz, g * v.dir.xyz);

}

float tangDot(localTangVector u, localTangVector v){
    return dot(u.dir.xyz, v.dir.xyz);
}

float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

float tangNorm(localTangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

tangVector tangNormalize(tangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return tangVector(v.pos, v.dir/tangNorm(v));
}

localTangVector tangNormalize(localTangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return localTangVector(v.pos, v.dir/tangNorm(v));
}

float cosAng(tangVector u, tangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}

float cosAng(localTangVector u, localTangVector v){
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



vec4 movePosQuadrant(vec4 dir, out Isometry fixIsom) {
    // Given the direction (dir) of a tangent vector AT THE ORIGIN,
    // move it back to the positive quadrant (x > 0, y > 0, z > 0) using the global isometries defined above.
    // keep track of the applied isometries in the following way : fixIsom is updated so that fixIsom * res = dir
    // note that refX, refY and rotXY have order two, hence they equal their inverses.

    vec4 res = dir;
    fixIsom = identity;

    if (res.x < -0.) {
        res = translate(refX, res);
        fixIsom = composeIsometry(fixIsom, refX);
    }
    if (res.y < 0.) {
        res = translate(refY, res);
        fixIsom = composeIsometry(fixIsom, refY);
    }
    if (res.z < 0.) {
        res = translate(rotXY, res);
        fixIsom = composeIsometry(fixIsom, rotXY);
    }

    return res;
}

//--------------------------------------------
// GLOBAL GEOMETRY
//--------------------------------------------

/*
  Methods computing ``global'' objects
*/

float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    // Isometry moving back to the origin and conversely
    Isometry isomInv = makeInvLeftTranslation(p);

    //vec4 qOrigin = translate(isomInv, q);
    //return  sqrt(exp(-2. * qOrigin.z) * qOrigin.x * qOrigin.x +  exp(2. * qOrigin.z) * qOrigin.y * qOrigin.y + qOrigin.z * qOrigin.z);
    return length(q-p);
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return fakeDistance(p, q);
}

float exactDist(tangVector u, tangVector v){
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

tangVector flow(tangVector tv, float t){
    // follow the geodesic flow during a time t

    return tangVector(tv.pos + t * tv.dir, tv.dir);
    /*
        // Isometry moving back to the origin and conversely
        Isometry isom = makeLeftTranslation(tv);
        Isometry isomInv = makeInvLeftTranslation(tv);

        tangVector tvOrigin = translate(isomInv, tv);

        // represent at every step the pull back of the tangent vector at the origin
        vec4 u = tvOrigin.dir;
        // the position along the geodesic
        vec4 posAux = ORIGIN;
        // isometry to move the origin to the given position
        Isometry isomAux = Isometry(mat4(1.0));
        vec4 field;

        // integrate numerically the flow
        int n = int(floor(t/EULER_STEP));
        for (int i = 0; i < n; i++){
            posAux = posAux + EULER_STEP * translate(isomAux, u);
            isomAux = makeLeftTranslation(posAux);
            if (i != n-1) {
                field = vec4(
                -u.x * u.z,
                u.y * u.z,
                u.x * u.x - u.y * u.y,
                0.
                );
                u = normalize(u + EULER_STEP*field);
            }
        }
        tangVector resOrigin = translate(isomAux, tangVector(ORIGIN, u));

        return translate(isom, resOrigin);
    */
}

uniform highp sampler3D lookupTableX;
uniform highp sampler3D lookupTableY;
uniform highp sampler3D lookupTableZ;
uniform highp sampler3D lookupTableTheta;
uniform highp sampler3D lookupTablePhi;
//uniform highp sampler3D lookupTableUX;
//uniform highp sampler3D lookupTableUY;
//uniform highp sampler3D lookupTableUZ;
uniform int timeSlices;
uniform float margin1;
uniform float margin2;


localTangVector eucFlow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t

    return localTangVector(tv.pos + t * tv.dir, tv.dir);
}


/*localTangVector tableFlow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t


    // isom to move to the starting point
    Isometry isom = makeLeftTranslation(tv);

    // move the tangent vector in the positive quadrant
    // record the isometry moving the tangent vector back to its initial position
    Isometry fixQuadrant;
    vec4 posDir = tv.dir;
    posDir = movePosQuadrant(posDir, fixQuadrant);

    // address of the vexel to look at in the pictures
    // sph has coordinates (r,theta, phi, 0.)
    vec4 sph = car2sph(posDir);
    // the texture covers the positive quadrant,
    // i.e. the angles theta and phi run over [0, pi/2] (because of the symmetries)
    vec3 address = vec3(2. * sph.y / PI, 2. * sph.z / PI, t);

    // extracting data from the lookupTables
    float x = texture(lookupTableX, address).r;
    float y = texture(lookupTableY, address).r;
    float z = texture(lookupTableZ, address).r;
    float theta = texture(lookupTableTheta, address).r;
    float phi = texture(lookupTablePhi, address).r;

    // packaging the result
    vec4 newPos = vec4(x, y, z, 1.);
    vec4 newLocalDir = sph2car(vec4(1., theta, phi, 0.));

    // undo the initial symmetries (that moved the tangent vector to the positive quadrant)
    // note that fixIsom is not an element of the "Sol group R^3"
    // unlike wiht position, the coordinateds (x,y,z) of the point, do not capture those symmetries
    // hence we have to apply fixIsom to both the point and the direction
    newPos = translate(fixQuadrant, newPos);
    newLocalDir = translate(fixQuadrant, newLocalDir);

    localTangVector res =  localTangVector(newPos, newLocalDir);


    // move back the origin to the starting point of the geodesic
    res = translate(isom, res);

    return res;


}

localTangVector flow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t

    // return eucFlow(tv, t);
    return tableFlow(tv, t);

}*/

localTangVector flow(localTangVector tv, int marchStepIndex) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t
    // the time is characterized by the time index in the texture

    // isom to move to the starting point
    Isometry isom = makeLeftTranslation(tv);


    // move the tangent vector in the positive quadrant
    // record the isometry moving the tangent vector back to its initial position
    Isometry fixQuadrant;
    vec4 posDir = tv.dir;
    posDir = movePosQuadrant(posDir, fixQuadrant);



    //Address used with a texture in spherical coordinates

    // address of the vexel to look at in the pictures
    // sph has coordinates (r,theta, phi, 0.)
    vec4 sph = car2sph(posDir);
    // the texture covers the positive quadrant,
    // i.e. the angles theta and phi run over [0, pi/2] (because of the symmetries)
    // the "time" coordinate consists in bringing back between 0. and 1. the marchStepIndex
    // TODO. Since the marching steps are now really discrete,
    // maybe it would be better to pass one 2D texture per time step?
    float s = float(marchStepIndex)/ float(timeSlices + 1);
    vec3 address = vec3(2. * sph.y / PI, 2. * sph.z / PI, s);


    // extracting data from the lookupTables
    float x = texture(lookupTableX, address).r;
    float y = texture(lookupTableY, address).r;
    float z = texture(lookupTableZ, address).r;
    float theta = texture(lookupTableTheta, address).r;
    float phi = texture(lookupTablePhi, address).r;

    // packaging the result
    vec4 newPos = vec4(x, y, z, 1.);
    vec4 newLocalDir = sph2car(vec4(1., theta, phi, 0.));


    /*
    vec2 loc = pToLocal(radProj(posDir));
    float s = float(marchStepIndex)/ float(timeSlices + 1);
    vec3 address = vec3 ((margin1 + loc.x) / (1. + 2. * margin1), (margin2 + loc.y) / (1. + 2. * margin2), s);

    float x = texture(lookupTableX, address).r;
    float y = texture(lookupTableY, address).r;
    float z = texture(lookupTableZ, address).r;
    float ux = texture(lookupTableUX, address).r;
    float uy = texture(lookupTableUY, address).r;
    float uz = texture(lookupTableUZ, address).r;


    // packaging the result
    vec4 newPos = vec4(x, y, z, 1.);
    vec4 newLocalDir = vec4(ux, uy, uz, 0.);
    */

    // undo the initial symmetries (that moved the tangent vector to the positive quadrant)
    // note that fixIsom is not an element of the "Sol group R^3"
    // unlike wiht position, the coordinateds (x,y,z) of the point, do not capture those symmetries
    // hence we have to apply fixIsom to both the point and the direction
    newPos = translate(fixQuadrant, newPos);
    newLocalDir = translate(fixQuadrant, newLocalDir);

    localTangVector res =  localTangVector(newPos, newLocalDir);


    // move back the origin to the starting point of the geodesic
    res = translate(isom, res);

    return res;


}


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------


//project point back onto the geometry
vec4 geomProject(vec4 p){
    return p;
}


//Project onto the Klein Model
vec4 modelProject(vec4 p){
    return p;

}


//-------------------------------------------------------
// LIGHT
//-------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if (FAKE_LIGHT_FALLOFF){
        //fake linear falloff
        return dist;
    }
    return dist*dist;
}


//---------------------------------------------------------------------
//Raymarch Primitives
//---------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;

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

float horizontalSliceSDF(vec4 p, float h1, float h2) {
    //signed distance function to the half space h1 < z < h2

    return max(p.z - h2, h1-p.z);
    /*
    if(p.z < h1){
        return  h1 - p.z;
    }
    else if (p.z > h2) {
        return p.z - h2;
    }
    else{
        return max (p.z - h2, h1-p.z);
    }
    */
}

float sliceSDF(vec4 p){
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -0.3);
    return max(HS1, HS2);
}

//--------------------------------------------
//Global Constants
//--------------------------------------------
const int MAX_MARCHING_STEPS =  300;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float MAX_STEP_DIST = 0.9;// Maximal length of a step... depends of the generated texture.
const float EPSILON = 0.0001;
//const float EPSILON = 0.051;
const float fov = 90.0;


//--------------------------------------------
//Global Variables
//--------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
int hitWhich = 0;


Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;

//-------------------------------------------
//Translation & Utility Variables
//--------------------------------------------
uniform int isStereo;
uniform vec2 screenResolution;
uniform mat4 invGenerators[6];
uniform mat4 currentBoostMat;
uniform mat4 leftBoostMat;
uniform mat4 rightBoostMat;
uniform mat4 facing;
uniform mat4 leftFacing;
uniform mat4 rightFacing;
uniform mat4 cellBoostMat;
uniform mat4 invCellBoostMat;
//--------------------------------------------
// Lighting Variables & Global Object Variables
//--------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoostMat;
uniform float globalSphereRad;
uniform samplerCube earthCubeTex;


//--------------------------------------------
// Re-packaging isometries, facings in the shader
//--------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function


//---------------------------------------------------------------------
// Scene Definitions
//---------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    //vec4 center = ORIGIN;
    //float sphere = centerSDF(p, center, centerSphereRadius);
    //float vertexSphere = 0.0;
    //vertexSphere = vertexSDF(abs(p), modelCubeCorner, vertexSphereSize);
    //float final = min(vertexSphere, sphere);//unionSDF
    //return final;

    vec4 center = vec4(0., 0., 0., 1.);;
    float sphere = centerSDF(p, center, 0.4);
    return sphere;

    //    float slabDist;
    //    float sphDist;
    //    slabDist = sliceSDF(p);
    //    sphDist=sphereSDF(p,vec4(0.,0.,-0.2,1.),0.28);
    //    return max(slabDist,-sphDist);
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

    float objDist;
    //    float slabDist;
    //    float sphDist;
    //    slabDist = sliceSDF(absolutep);
    //    sphDist=sphereSDF(absolutep,vec4(0.,0.,-0.2,1.),0.5);
    //    objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;


    //horizontalSliceSDF(absolutep, -0.2, -0.4);

    //global plane




    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    //objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    objDist = sphereSDF(absolutep, globalObjPos,0.3);

    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
    }
    return distance;
}


// check if the given point p is in the fundamental domain of the lattice.

float denominator=GoldenRatio+2.;

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);


    //lattice basis divided by the norm square
    vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
    vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
    vec4 v3 = vec4(0., 0., 1./z0, 0.);
    /*
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }*/

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
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}

// overload of the previous method with tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
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
// DOING THE RAYMARCH
//--------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
/*
void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    totalFixMatrix = identity;


    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);

            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(0.1, localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    hitWhich = 3;
                    sampletv = localtv;
                    break;
                }
                // return the biggest power of 1/2 which is smaller than localDist
                marchStep = min(MAX_STEP_DIST, localDist);
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else { localDepth=MAX_DIST; }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identity;
                sampletv = tv;
                return;
            }
            // return the biggest power of 1/2 which is smaller than globalDist
            marchStep = min(MAX_STEP_DIST, globalDist);
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}
*/

int findMarchStepIndex(float t) {
    // return the time index in the lookup table of the largest time step  which is
    // - time_step = 0 is t = 0
    // - smaller than t, if posible (if t is too small, we return the smallest non-zero index in the table)
    // recall that the time recorded in the lookup table have the following form
    // If k is the index of the time slice, then
    // time = 0, if k = 0
    // time = 1 / 2 ^ (timeSlices + 1 - k), otherwise, i.e for k in {1, ..., timeSlices + 1}

    if (t == 0.) {
        return 0;
    }

    float aux = 1.;
    int index = timeSlices + 1;
    for (int i = 0; i < timeSlices; i++) {
        if (aux < t) {
            break;
        }
        aux = 0.5 * aux;
        index = index - 1;
    }
    return index;
}

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    // overlaod of the raymarching with localTangVector
    // version for lookup table with a marchStepIncex

    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    int marchStepIndex = 0;// index in the lookup table of the marchStep
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identity;


    // Trace the local scene, then the global scene:


    if (TILING_SCENE){
        int crossing = 0;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            marchStepIndex = findMarchStepIndex(marchStep);
            localtv = flow(localtv, marchStepIndex);

            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                marchStep = MIN_DIST;
                crossing += 1;
                //
                //                if(crossing == 2) {
                //                    hitWhich =5;
                //                    if(abs(fixMatrix.matrix[3][0]) == 1.){
                //                        debugColor = vec3(1,0,0);
                //                    }
                //                    if(abs(fixMatrix.matrix[3][1]) == 1.){
                //                        debugColor = vec3(0,1,0);
                //                    }
                //                    if(fixMatrix.matrix[3][2] != 0.){
                //                        if (fixMatrix.matrix[3][2] >0.) {
                //                            debugColor = vec3(0.7,0.7,1);
                //                        }
                //                        else {
                //                            debugColor = vec3(0,0,0.5);
                //                        }
                //
                //                    }
                //                    break;
                //                }

            }
            else {
                float localDist = min(0.1, localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    //                    if(crossing > 0) {
                    //                        hitWhich = 3;
                    //                    sampletv = toTangVector(localtv);
                    //                    break;
                    //                    }
                    //                    else {
                    //                        localDist =0.2;
                    //                    }

                    hitWhich = 3;
                    sampletv = toTangVector(localtv);
                    break;
                    //                     hitWhich = 5;
                    //                   debugColor=0.5*translate(totalFixMatrix,localtv).dir.xyz;
                    //                    break;
                }
                marchStep = min(MAX_STEP_DIST, localDist);
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else { localDepth=MAX_DIST; }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            marchStepIndex = findMarchStepIndex(marchStep);
            tv = flow(tv, marchStepIndex);

            /*
            if (i == 4) {
                hitWhich = 5;
                //debugColor = vec3(marchStep, 0., 0.);
                debugColor = 0.25*abs(tv.pos.xyz);
                break;
            }*/


            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                //hitWhich = 5;
                //debugColor = vec3(1.,0.,0.);

                totalFixMatrix = identity;
                sampletv = toTangVector(tv);
                return;
                //                totalFixMatrix = identity;
                //                hitWhich=5;
                //                debugColor=0.5*tv.dir.xyz;
                //                return;
            }
            marchStep = min(MAX_STEP_DIST, globalDist);
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
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
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    for (int i = 0; i<4; i++){
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, lightPositions[i]);
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
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
    pt = inverse(globalObjectBoost.matrix) * pt;
    return tangDirection(ORIGIN, pt).dir.xyz;
}


vec3 ballColor(Isometry totalFixMatrix, tangVector sampletv){
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixMatrix, color);
        //color = 0.9*color+0.1;
        return 0.5*color + 0.5*color2;
    }
    else {
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        color = 0.9*color+0.1;
        return color;
        //generically gray object (color= black, glowing slightly because of the 0.1)
    }
}


vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    if (FAKE_LIGHT){
        //make the objects have their own color
        //color the object based on its position in the cube
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
        //if we are doing TRUE LIGHTING
        // objects have no natural color, only lit by the lights
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        return color;
    }
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

    currentBoost=Isometry(currentBoostMat);
    leftBoost=Isometry(leftBoostMat);
    rightBoost=Isometry(rightBoostMat);
    cellBoost=Isometry(cellBoostMat);
    invCellBoost=Isometry(invCellBoostMat);
    globalObjectBoost=Isometry(globalObjectBoostMat);


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

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
    raymarch(toLocalTangVector(rayDir), totalFixMatrix);
    //raymarch(rayDir, totalFixMatrix);

    /*
    hitWhich = 5;
    // the coordinate used to get data from the texture are between 0 and 1
    if(depth == -1.) {
        debugColor = vec3(0.);
    }
    else {
        vec3 p = vec3(gl_FragCoord.x/screenResolution.x, gl_FragCoord.y/screenResolution.y, 0.005*depth);
        float x = texture(lookupTableX, p).r;
        float y = texture(lookupTableY, p).r;
        float z = texture(lookupTableZ, p).r;
        float theta = texture(lookupTableTheta, p).r;
        float phi = texture(lookupTablePhi, p).r;
        debugColor = abs(vec3((theta+PI)/(2.*PI), phi/PI, 0.));
        //debugColor = 0.5 + 0.5*vec3(x, y, z);
    }*/


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.3);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor=ballColor(totalFixMatrix, sampletv);
        out_FragColor = vec4(pixelColor, 1.0);
        return;
    }
    else {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

}