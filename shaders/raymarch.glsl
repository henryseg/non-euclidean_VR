#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

const bool FAKE_LIGHT = true;
const bool FAKE_DIST_SPHERE = false;
const float globalObjectRadius = 0.2;


//--------------------------------------------
// "TRUE" CONSTANTS
//--------------------------------------------

const float PI = 3.1415926538;

const vec4 ORIGIN = vec4(0, 0, 0, 1);
const float modelHalfCube = 0.5;

//generated in JS using translateByVector(new THREE.Vector3(-c_ipDist,0,0));
const mat4 leftBoost = mat4(1., 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
-0.032, 0, 0, 1.);

//generated in JS using translateByVector(new THREE.Vector3(c_ipDist,0,0));
const mat4 rightBoost = mat4(1., 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
0.032, 0, 0, 1.);

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
  

    return dot(u.dir.xyz,  v.dir.xyz);

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

float fakeHeight(float z) {
    // fake height : bound on the height of the ball centered at the origin passing through p
    // (whose z coordinate is the argument)

    return sqrt(fakeHeightSq(z));
//    if (z < sqrt(6.)){
//        return z;
//    }
//    else if (z < 4.*sqrt(3.)){
//        return 2.*sqrt(3.)*sqrt(pow(0.75*z, 2./3.)-1.);
//    }
//    else {
//        return sqrt(2.*sqrt(3.)*z);
//    }
}



float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance
    return length(q-p);
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
   return length(q-p);
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
        return tangVector(p, normalize(q-p));
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}

tangVector flow(tangVector tv, float t){
    // follow the geodesic flow during a time t
return tangVector(tv.pos+t*tv.dir,tv.dir);
  
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
            return exactDist(p, center) - radius;
      
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
vec4 globalLightColor = ORIGIN;
int hitWhich = 0;
//-------------------------------------------
//Translation & Utility Variables
//--------------------------------------------
uniform int isStereo;
uniform vec2 screenResolution;
uniform mat4 invGenerators[6];
uniform mat4 currentBoost;
uniform mat4 facing;
uniform mat4 cellBoost;
uniform mat4 invCellBoost;
//--------------------------------------------
// Lighting Variables & Global Object Variables
//--------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoost;


//---------------------------------------------------------------------
// Scene Definitions
//---------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    vec4 center = vec4(0, 0, 0., 1.);
    float sphere = centerSDF(p, ORIGIN, 0.68);
    float final = -sphere;
    return final;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
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


// check if the given point p is in the fundamental domain of the lattice.
bool isOutsideCell(vec4 p, out mat4 fixMatrix){
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

// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out mat4 fixMatrix){
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

void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    totalFixMatrix = mat4(1.0);


    // Trace the local scene, then the global scene:
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        localtv = flow(localtv, marchStep);

        if (isOutsideCell(localtv, fixMatrix)){
            totalFixMatrix = fixMatrix * totalFixMatrix;
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
            marchStep = localDist;
            globalDepth += localDist;
        }
    }

    // Set for localDepth to our new max tracing distance:
    localDepth = min(globalDepth, MAX_DIST);
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = flow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
        if (globalDist < EPSILON){
            // hitWhich has now been set
            totalFixMatrix = mat4(1.0);
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
    if (isStereo == 1){
        // REMI : to be checked...
        if (isLeft){
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir = translate(rightBoost, rayDir);
        }
    }

    //camera position must be translated in hyperboloid -----------------------

    if (isStereo == 1){
        // REMI : Not sur about what is this
        rayDir = tangVector(facing * rayDir.pos, rayDir.dir);
    }

    //rayOrigin = currentBoost * rayOrigin;
    rayDir = applyMatrixToDir(facing, rayDir);
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
        out_FragColor = vec4(0.01);
        return;
    }
    else if (hitWhich == 1){ // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){ //debug
        out_FragColor = vec4(debugColor, 1.0);
    }
    else { // objects

        //color the object based on its position in the cube
        //interpreting the cube as the color cube
        float x=sampletv.pos[0];
        float y=sampletv.pos[1];
        float z=sampletv.pos[2];
        x = x * sqrt3;
        y = y * sqrt3;
        z = z * sqrt3;
        x = (x+1.0)/2.0;
        y = (y+1.0)/2.0;
        z = (z+1.0)/2.0;
        vec3 pixelcolor = vec3(x, y, z);


        N = estimateNormal(sampletv.pos);
        vec3 color;
        color = phongModel(totalFixMatrix, 0.2*pixelcolor);
        //just COLOR is the normal here.  Adding a constant makes it glow a little (in case we mess up lighting)
        out_FragColor = vec4(0.9*color+0.1, 1.0);
    }
}