/// Edit this file, then run the python 3 script "shaderToPPScript.py" to convert it into a javascript file, "ray.js". 


//what does this vertex shader do?
BEGIN VERTEX
void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}
END VERTEX

BEGIN FRAGMENT


vec3 debugColor = vec3(0.5,0,0.8);

//--------------------------------------------------------------------
// Hyperbolic Functions
//--------------------------------------------------------------------
/*float cosh(float x){
    float eX = exp(x);
    return (0.5 * (eX + 1.0/eX));
}

float acosh(float x){ //must be more than 1
    return log(x + sqrt(x*x-1.0));
}

float sinh(float x){
    float eX = exp(x);
    return (0.5 * (eX - 1.0/eX));
}*/


//--------------------------------------------
//GEOM DEPENDENT
//--------------------------------------------


//--------------------------------------------
//Geometry Constants
//--------------------------------------------
//  const float HalfCube=0.6584789485;
//const float modelHalfCube = 0.5773502692;
// const float vertexSphereSize = -0.98;//In this case its a horosphere
// const float centerSphereSize = 1.55* HalfCube;
//This next part is specific still to hyperbolic space as the horosphere takes an ideal point in the Klein Model as its center.
//  const vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);
const float globalObjectRadius = 0.2;
const vec4 ORIGIN = vec4(0, 0, 0, 1);


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


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------

//Hyperboloid Model
/*
float geomDot(vec4 u, vec4 v){
    return -u.x*v.x - u.y*v.y - u.z*v.z + u.w*v.w;// Lorentz Dot
}//this is the NEGATIVE of the standard dot product so that now the vectors on the hyperboloid have positive lengths.

float geomNorm(vec4 v){
    return sqrt(abs(geomDot(v, v)));
}*/

float tangDot(vec4 p, vec4 u, vec4 v){
    // metric tensor at the point p
    mat3 g = mat3(
    0.25*pow(p.y, 2.) +1., -0.25*p.x*p.y, 0.5*p.y,
    -0.25*p.x*p.y, 0.25*pow(p.x, 2.)+1., -0.5*p.x,
    0.5*p.y, -0.5*p.x, 1.
    );
    return dot(u.xyz , g * v.xyz);
   
}


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

mat4 nilMatrix(vec4 p) {
    // return the Heisenberg isometry sending the origin to p
    // this is in COLUMN MAJOR ORDER so the things that LOOK LIKE ROWS are actually FUCKING COLUMNS!
    return mat4(
        1., 0., -p.y/2., 0.,
        0.,1., p.x/2., 0.,
        0.,0.,1.,0.,
        p.x,p.y,p.z,1.);  
}

mat4 nilMatrixInv(vec4 p) {
    // return the Heisenberg isometry sending the p to origin
    return mat4(
        1., 0., p.y/2., 0.,
        0.,1., -p.x/2., 0.,
        0.,0.,1.,0.,
        -p.x,-p.y,-p.z,1.);
}

float fakeHeight(float z) {
    // fake height : bound on the height of the ball centered at the origin passing through p
    // (whose z coordinate is the argument)
    
    if (z < sqrt(6.)){
        return z;
    }
    else if (z < 4.*sqrt(3.)){
        return 2.*sqrt(3.)*sqrt(pow(0.75*z, 2./3.)-1.);
    }
    else {
        return sqrt(2.*sqrt(3.)*z);
    }
}


// measure the distance between two points in the geometry
// fake distance
float geomDistance(vec4 p, vec4 q){
    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv*q;
    // we now need the distance between the origin and p
    float rho = sqrt(pow(qOrigin.x, 2.)+pow(qOrigin.y, 2.));
    float h = fakeHeight(qOrigin.z);
    
    return pow(0.2*pow(rho, 4.) + 0.8*pow(h, 4.), 0.25);
    //return length(v-u);
}

//light intensity as a fn of distance
float lightAtt(float dist){
    return dist;//fake linear falloff (correct is below)

}


//--------------------------------------------
//Geometry of the Tangent Space
//--------------------------------------------

//calculate the length of a tangent vector
float tangNorm(vec4 p, vec4 v){
    return sqrt(abs(tangDot(p, v, v)));
}

//create a unit tangent vector in a given direction
vec4 tangNormalize(vec4 p, vec4 u){
    return u/tangNorm(p, u);
}

//cosAng takes in a point p
float cosAng(vec4 p, vec4 u, vec4 v){
    return tangDot(p, u, v);
}


mat4 tangBasis(vec4 p){
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

//-------------------------------------------------------
//AUXILIARY FUNCTIONS FOR TANGENT DIRECTION
//-------------------------------------------------------

const float PI = 3.1415926538;
const int MAX_NEWTON_INIT_ITERATION = 10000;
const int MAX_NEWTON_ITERATION = 10000;
const float MAX_NEWTON_INIT_TOLERANCE = 0.1;
const float NEWTON_TOLERANCE = 0.01;


// the function f whose zeros need to be found
float f(float rho, float x3, float phi){
    return pow(rho, 2.0) * (phi - sin(phi)) - 8.0 * (x3 - phi) * pow(sin(0.5 * phi), 2.0);
}

// the derivative of f
float df(float rho, float x3, float phi){
    return 2.0 * sin(0.5 * phi) * ((pow(rho, 2.0) + 4.0) * sin(0.5 * phi) - 4.0 * (x3 -phi) * cos(0.5 * phi));
}

// the second derivative of f
float d2f(float rho, float x3, float phi){
    return (pow(rho, 2.0) + 8.0) * sin(phi) - 4.0 * (x3 - phi) * cos(phi);
}

// rough zero, to start newton method (with a check on convexity)
float newton_init(float rho, float x3) {
    if (x3 < PI) {
        // if x3 < pi, x3 is a good start for the Newthon method
        return x3;
    }
    else {
        // if x3 > pi, do a dichotomy to find the best start
        float phi0 = 0.0;
        float d20 = d2f(rho, x3, phi0);
        float phi1 = min(2.0 * PI, x3);
        float d21 = d2f(rho, x3, phi1);

        for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++) {
            // step of the dichotomy
            float phi_aux = 0.5 * phi0 + 0.5 * phi1;
            float val = f(rho, x3, phi_aux);
            float d2_aux = d2f(rho, x3, phi_aux);
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
float newton_zero(float rho, float x3) {
    float phi = newton_init(rho, x3);
    float val = f(rho, x3, phi);
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        if (abs(val) < NEWTON_TOLERANCE){
            return phi;
        }
        phi = phi - val/df(rho, x3, phi);
        val = f(rho, x3, phi);
    }
    return phi;
}


//-------------------------------------------------------
//GEODESIC FUNCTIONS
//-------------------------------------------------------

//give the unit tangent to geodesic connecting p to q.
vec4 tangDirection(vec4 p, vec4 q){

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
        float rho = sqrt(pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.));
        float phi = newton_zero(rho, x3);
        float sign = 0.0;
        if (x3 > 0.0) {
            sign = 1.0;
        }
        else {
            sign = -1.0;
        }
        float w = sign * 2.0 * sin(0.5 * phi) / sqrt(pow(rho, 2.0) + 4.0 * pow(sin(0.5 * phi), 2.0));
        float c = sqrt(1.0  - pow(w, 2.0));
        float alpha = - 0.5 * phi;
        if(qOrigin.x*qOrigin.y != 0.0){
            alpha = alpha + atan(qOrigin.y, qOrigin.x);
        }
        float t = phi / w;

        resOrigin =  t * vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
    }

    // move back to p
    return isom * resOrigin;
}

// Get point at distance dist on the geodesic from u in the direction v (unit tangent vector)
vec4 geodesicEndpt(vec4 p, vec4 v, float dist){

    // move p to the origin
    mat4 isom = nilMatrix(p);
    mat4 isomInv = nilMatrixInv(p);

    // vector at the origin
    vec4 vOrigin = isomInv * v;

    // solve the problem !
    float c = sqrt(pow(vOrigin.x, 2.)+ pow(vOrigin.y, 2.));
    float alpha = 0.;
    if(vOrigin.x*vOrigin.y != 0.0){
        alpha = atan(vOrigin.y, vOrigin.x);
    }
    float w = vOrigin.z;

    vec4 achievedFromOrigin = vec4(0.,0.,0.,1.);

    if (w == 0.0){
        achievedFromOrigin = vec4(dist * vOrigin.xyz,1);
    }
    else {
        achievedFromOrigin = vec4(
        2. * (c/w) * sin(0.5 * w * dist) * cos(0.5 * w * dist + alpha),
        2. * (c/w) * sin(0.5 * w * dist) * sin(0.5 * w * dist + alpha),
        w * dist + 0.5 * pow(c / w, 2.) * (w * dist - sin(w * dist)),
        1.
        );
    }

    // move back to p
    return isom * achievedFromOrigin;
}

//get unit tangent vec at endpt of geodesic
vec4 tangToGeodesicEndpt(vec4 p, vec4 v, float dist){

    // move p to the origin
    mat4 isom = nilMatrix(p);
    mat4 isomInv = nilMatrixInv(p);

    // vector at the origin
    vec4 vOrigin = isomInv * v;

    // solve the problem !
    float c = sqrt(pow(vOrigin.x, 2.)+ pow(vOrigin.y, 2.));
    float alpha = 0.;
    if(vOrigin.x*vOrigin.y != 0.0){
        alpha = atan(vOrigin.y, vOrigin.x);
    }
    float w = vOrigin.z;

    vec4 achievedFromOrigin = vec4(0.);

    if (w == 0.0){
        achievedFromOrigin = dist * vOrigin;
    }
    else {
        vec4 achievedFromOrigin = vec4(
        c * cos(w * dist + alpha),
        c * sin(w * dist + alpha),
        w + 0.5 * pow(c, 2.) / w  - 0.5 * pow(c, 2.) * cos(w * dist) / w,
        0.
        );
    }

    // move back to p
    return isom * achievedFromOrigin;
}


//---------------------------------------------------------------------
//Raymarch Primitives
//---------------------------------------------------------------------
// A horosphere can be constructed by offseting from a standard horosphere.
// Our standard horosphere will have a center in the direction of lightPoint
// and go through the origin. Negative offsets will shrink it.

/* float horosphereHSDF(vec4 samplePoint, vec4 lightPoint, float offset){
   return log(-geomDot(samplePoint, lightPoint)) - offset;
 }*/

//im assuming the log here measures distance somehow (hence geomdot....log probably related to acosh somehow)

float sphereSDF(vec4 samplePoint, vec4 center, float radius){
    return geomDistance(samplePoint, center) - radius;
}


//NEXT: We are going to determine which of these functions gets used for building the cube (deleting centers/corners)

/*float centerSDF(vec4 samplePoint, vec4 cornerPoint, float size){
    return sphereSDF(samplePoint, cornerPoint,size);
}*/

/*float vertexSDF(vec4 samplePoint, vec4 cornerPoint, float size){
    return  horosphereHSDF(samplePoint, cornerPoint, size);
}*/


//--------------------------------------------
//NOT GEOM DEPENDENT
//--------------------------------------------


//--------------------------------------------
//Global Constants
//--------------------------------------------
const int MAX_MARCHING_STEPS = 48;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
const float fov = 90.0;


//--------------------------------------------
//Global Variables
//--------------------------------------------
vec4 N = ORIGIN;//normal vector
vec4 sampleEndPoint = vec4(1, 1, 1, 1);
vec4 sampleTangentVector = vec4(1, 1, 1, 1);
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
//Lighting Variables & Global Object Variables
//--------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoost;


//---------------------------------------------------------------------
//Scene Definitions
//---------------------------------------------------------------------
//Turn off the local scene
float localSceneSDF(vec4 samplePoint){
    /*float sphere = centerSDF(samplePoint, ORIGIN, centerSphereSize);
    float vertexSphere = 0.0;
    vertexSphere = vertexSDF(abs(samplePoint), modelCubeCorner, vertexSphereSize);
    float final = -min(vertexSphere,sphere); //unionSDF
    */
    return 101.;
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
float globalSceneSDF(vec4 samplePoint){
    vec4 absoluteSamplePoint = cellBoost * samplePoint;// correct for the fact that we have been moving
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(absoluteSamplePoint, lightPositions[i],
        0.1                   
 //1.0/(10.0*lightIntensities[i].w)
                           );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            //hitWhich = 5;
            //debugColor = lightPositions[i].xyz;
            //return distance;
            
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    //Global Sphere Object
    float objDist;
    objDist = sphereSDF(absoluteSamplePoint, globalObjectBoost[3], globalObjectRadius);
    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
    }
    return distance;
}


// This function is intended to be hyp-agnostic.
// We should update some of the variable names.
//TURN OFF TELEPORTING
bool isOutsideCell(vec4 samplePoint, out mat4 fixMatrix){
    vec4 modelSamplePoint = modelProject(samplePoint);//project to klein
    /*
  if(modelSamplePoint.x > modelHalfCube){
    fixMatrix = invGenerators[0];
    return true;
  }
  if(modelSamplePoint.x < -modelHalfCube){
    fixMatrix = invGenerators[1];
    return true;
  }
  if(modelSamplePoint.y > modelHalfCube){
    fixMatrix = invGenerators[2];
    return true;
  }
  if(modelSamplePoint.y < -modelHalfCube){
    fixMatrix = invGenerators[3];
    return true;
  }
  if(modelSamplePoint.z > modelHalfCube){
    fixMatrix = invGenerators[4];
    return true;
  }
  if(modelSamplePoint.z < -modelHalfCube){
    fixMatrix = invGenerators[5];
    return true;
  }*/
    return false;
}


//--------------------------------------------
//GEOM DEPENDENT
//--------------------------------------------



//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
vec4 estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
    // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
    float newEp = EPSILON * 10.0;
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    if (hitWhich != 3){ //global light scene
        return tangNormalize(p, //p+EPSILON*basis_x should be lorentz normalized however it is close enough to be good enough
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z)));
    }
    else { //local scene
        return tangNormalize(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z)));
    }
}


//--------------------------------------------
// NOT GEOM DEPENDENT
//--------------------------------------------

void raymarch(vec4 rO, vec4 rD, out mat4 totalFixMatrix){
    mat4 fixMatrix;
    float globalDepth = MIN_DIST;
    float localDepth = globalDepth;
    vec4 localrO = rO;
    vec4 localrD = rD;
    totalFixMatrix = mat4(1.0);

    // Trace the local scene, then the global scene:
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        vec4 localEndPoint = geodesicEndpt(localrO, localrD, localDepth);

        if (isOutsideCell(localEndPoint, fixMatrix)){
            totalFixMatrix = fixMatrix * totalFixMatrix;
            vec4 localEndTangent = tangToGeodesicEndpt(localrO, localrD, localDepth);
            localrO = geomNormalize(fixMatrix * localEndPoint);
            //the version working in the other geometries is below.
            //there is flickering when we do this in hyperbolic space though
            //  localrD = tangNormalize(fixMatrix * localEndTangent);
            //used to be this, which seems to work better here
            localrD=tangDirection(localrO, fixMatrix * localEndTangent);
            localDepth = MIN_DIST;
        }
        else {
            float localDist = min(0.5, localSceneSDF(localEndPoint));
            if (localDist < EPSILON){
                hitWhich = 3;
                sampleEndPoint = localEndPoint;
                sampleTangentVector = tangToGeodesicEndpt(localrO, localrD, localDepth);
                break;
            }
            localDepth += localDist;
            globalDepth += localDist;
        }
    }

    // Set for localDepth to our new max tracing distance:
    localDepth = min(globalDepth, MAX_DIST);
    globalDepth = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        vec4 globalEndPoint = geodesicEndpt(rO, rD, globalDepth);
//        hitWhich = 5;
//        debugColor = abs(rO.xyz);
//        break;
        
        float globalDist = globalSceneSDF(globalEndPoint);
        if (globalDist < EPSILON){
            // hitWhich has now been set
            totalFixMatrix = mat4(1.0);
            sampleEndPoint = globalEndPoint;
            sampleTangentVector = tangToGeodesicEndpt(rO, rD, globalDepth);
            return;
        }
        globalDepth += globalDist;
        if (globalDepth >= localDepth){
            break;
        }
    }
}


//--------------------------------------------------------------------
// Lighting Functions
//--------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(vec4 SP, vec4 TLP, vec4 V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    vec4 L = tangDirection(SP, TLP);
    vec4 R = 2.0*cosAng(SP, L, N)*N-L;
    //Calculate Diffuse Component
    float nDotL = max(cosAng(SP, N, L), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(SP, R, V), 0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV, 10.0);
    //Attenuation - Inverse Square
    float distToLight = geomDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
    //Compute final color
    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(mat4 totalFixMatrix){
    vec4 SP = sampleEndPoint;
    vec4 TLP;//translated light position
    vec4 V = -sampleTangentVector;
    vec3 color = vec3(0.0);
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

vec4 getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    vec4 v =  tangNormalize(ORIGIN, vec4(xy, -z, 0.0));
    return v;
}

//--------------------------------------------------------------------
// Main
//--------------------------------------------------------------------

void main(){
    vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    vec4 rayDirV = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);
    if (isStereo == 1){
        if (isLeft){
            rayOrigin = leftBoost * rayOrigin;
            rayDirV = leftBoost * rayDirV;
        }
        else {
            rayOrigin = rightBoost * rayOrigin;
            rayDirV = rightBoost * rayDirV;
        }
    }

    //camera position must be translated in hyperboloid -----------------------

    if (isStereo == 1){
        rayOrigin = facing * rayOrigin;
    }
    rayOrigin = currentBoost * rayOrigin;
    rayDirV = facing * rayDirV;
    rayDirV = currentBoost * rayDirV;
    //generate direction then transform to hyperboloid ------------------------
    //    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    mat4 totalFixMatrix = mat4(1.0);
    raymarch(rayOrigin, rayDirV, totalFixMatrix);

    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        gl_FragColor = vec4(0.2);
        return;
    }
    else if (hitWhich == 1){ // global lights
        gl_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if(hitWhich == 5){ //debug
      gl_FragColor = vec4(debugColor, 1.0);
    }
    else { // objects
        N = estimateNormal(sampleEndPoint);
        vec3 color;
        color = phongModel(totalFixMatrix);
        //just COLOR is the normal here.  Adding a constant makes it glow a little (in case we mess up lighting)
        gl_FragColor = vec4(0.8*color+0.2, 1.0);
    }
}
END FRAGMENT