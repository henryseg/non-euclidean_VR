#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/


//determine what we draw: ball and lights, 

const bool TILING_SCENE=true;//is there a local scene at all
const bool SOLAR_SYSTEM=true;
const bool TILING_TEXTURE=false;
const bool LOCAL_EARTH=true;
const bool TILING=true;

const bool GLOBAL_SCENE=false;
const bool GLOBAL_LIGHTS=false;
const bool LOCAL_LIGHTS=true;

const bool FAKE_LIGHT = false;
const bool FAKE_LIGHT_FALLOFF=false;
const bool FAKE_DIST_SPHERE = false;
const bool COLORED_SURFACE=true;

const bool EARTH=true;//turn on / off earth texture
const bool MOON=true; //turn on / off moon completely.
const bool SUN=true; // turn on / off the sun completely
//turn on solar lighting


//--------------------------------------------
// "TRUE" CONSTANTS
//----- ---------------------------------------

const float PI = 3.1415926538;

const vec4 ORIGIN = vec4(0, 0, 0, 1);

vec3 debugColor = vec3(0.5, 0, 0.8);

//--------------------------------------------
// AUXILIARY (BASICS)
//--------------------------------------------



float hypAng(vec4 p, vec4 q){
        //negative the lorentz dot product gives the hyperbolic angle between the two points on the hyperboloid model
    return -p.x*q.x-p.y*q.y-p.z*q.z+p.w*q.w;
}

vec4 hypProject(vec4 p){//Project a point onto the hyperboloid of one sheet or two sheets depending on original vector.
    return p/sqrt(abs(hypAng(p,p)));
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
  
    mat4 g = mat4(
    1.,0.,0.,0.,
    0.,1.,0.,0.,
    0.,0.,1.,0.,
    0.,0.,0.,-1.
    );

    return dot(u.dir,  g*v.dir);

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


//produce isometry to move from 0 to a point in direction v, of distance d 
// using this to test out an alternative definition of the tangBasis function
mat4 translateByVector(vec4 v){
    float len=length(v);
    float c1= sinh(len);
    float c2=cosh(len)-1.;
    if(len!=0.){
     float dx=v.x/len;
     float dy=v.y/len;
     float dz=v.z/len;
    
     mat4 m=mat4(
         0,0,0,dx,
         0,0,0,dy,
         0,0,0,dz,
         dx,dy,dz,0.
     );
    
    mat4 result = mat4(1.)+c1* m+c2*m*m;
    return result;
    }
    else{
    return mat4(1.);
    }
}


// moved tangBasis computation down below in global geometry


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------


//project back onto the geometry model
tangVector geomProject(tangVector tv){
    
   vec4 projPos=hypProject(tv.pos);
   return tangVector(projPos, tv.dir);
}

vec4 geomProject(vec4 p){
    //overloading previous function
   return hypProject(p);
}


//Project onto the Klein Model
vec4 modelProject(vec4 p){
    return p/p.w;
}



//--------------------------------------------
// Applying Isometries, Facings
//--------------------------------------------

tangVector translate(Isometry A, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    tangVector newVec= tangVector(A.matrix * v.pos, A.matrix * v.dir);
    return geomProject(newVec);
}

vec4 translate(Isometry A, vec4 v) {
    // overload of translate for moving only a point
   vec4 newVec= A.matrix * v;
   return geomProject(newVec);
}


tangVector rotateFacing(mat4 A, tangVector v){
        // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(v.pos, A*v.dir);
}

Isometry composeIsometry(Isometry A, Isometry B)
{
    return Isometry(A.matrix*B.matrix);
}

Isometry isometryInverse(Isometry A)
{
  return Isometry(inverse(A.matrix));
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
    return acosh(hypAng(p,q));
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
   return fakeDistance(p,q);
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
        return tangNormalize(tangVector(p, q - hypAng(p,q)*p));
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
     return tangDirection(u.pos, v.pos);
}

//flow along the geodesic starting at tv for a time t
tangVector flow(tangVector tv, float t){
    // follow the geodesic flow during a time t
    vec4 resPos=tv.pos*cosh(t) + tv.dir*sinh(t);
    //tangent is derivative of position
    vec4 resDir=tv.pos*sinh(t) + tv.dir*cosh(t);
    
    return geomProject(tangVector(resPos,resDir));
}


//basis for the tangent space at a point
mat4 tangBasis(vec4 p){
    float dist=acosh(p.w);
    vec4 direction = tangDirection(ORIGIN,p).dir;
    return translateByVector(dist*direction);
}





//-------------------------------------------------------
// LIGHT
//-------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if(FAKE_LIGHT_FALLOFF){
           //fake linear falloff
    return dist;
    }
 return sinh(dist)*sinh(dist);
}


//---------------------------------------------------------------------
//Raymarch Primitives
//---------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
            return exactDist(p, center) - radius;

}


 // A horosphere can be constructed by offseting from a standard horosphere.
  // Our standard horosphere will have a center in the direction of lightPoint
  // and go through the origin. Negative offsets will shrink it.
  float horosphereSDF(vec4 samplePoint, vec4 lightPoint, float offset){
    return log(-hypAng(samplePoint, lightPoint)) - offset;
  }



float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


float vertexSDF(vec4 p, vec4 cornerPoint, float size){
    return  horosphereSDF(abs(p), cornerPoint, size);
}

//--------------------------------------------
//Global Constants
//--------------------------------------------
const int MAX_MARCHING_STEPS = 80;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
const int BINARY_SEARCH_STEPS = 5;
const float fov = 90.0;
const float sqrt3 = 1.7320508075688772;


//--------------------------------------------
//Global Variables
//--------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
int hitWhich = 0;
bool hitLocal = false; // did we hit a local object or a global object?
int stepsTaken = 0;
Isometry identityIsometry=Isometry(mat4(1.0));
vec3 localLightColor=vec3(1.,1.,1.);

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;

Isometry earthBoost;
Isometry moonBoost;
Isometry sunBoost;
Isometry localEarthBoost;

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
uniform vec4 localLightPos;
uniform float localLightIntensity;
uniform int numLights;

uniform mat4 globalObjectBoostMat;
uniform mat4 globalObjectFacing;

uniform mat4 earthBoostMat;
uniform mat4 moonBoostMat;
uniform mat4 sunBoostMat;
uniform mat4 earthFacing;
uniform mat4 moonFacing;
uniform mat4 sunFacing;

uniform mat4 localEarthBoostMat;
uniform mat4 localEarthFacing;
uniform float localEarthRad;


uniform samplerCube earthCubeTex;
uniform samplerCube moonCubeTex;
uniform samplerCube sunCubeTex;
uniform sampler2D rockTex;

//--------------------------------------------
// Sliders
//--------------------------------------------
uniform float centerSphereRad;
uniform float vertexSphereRad;
uniform float earthRad;
uniform float moonRad;
uniform float sunRad;

uniform float modelHalfCube;//projection of cube to klein model
uniform float stereoScreenOffset;

//--------------------------------------------
// Re-packaging isometries, facings in the shader
//--------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function





//---------------------------------------------------------------------
// Scene Definitions
//---------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene
//
//float localSceneSDF(vec4 p){
//    float tilingDist=MAX_DIST;
//    float lightDist=MAX_DIST;
//    float earthDist=MAX_DIST;
//    float distance=MAX_DIST;
//    
//    if(LOCAL_LIGHTS){
//      vec4 lightCenter=vec4(0.,0.,0.,1.);
//      lightDist=sphereSDF(p,lightCenter,0.1);
//          
//        if (lightDist < EPSILON){
//            hitWhich = 1;
//            globalLightColor =lightPositions[1];
//            return lightDist;
//        }
//      
//    }
//    
//    
//    if(TILING_EARTH){
//      vec4 earthCenter=translate(localEarthBoost,ORIGIN);
//      earthDist=sphereSDF(p,earthCenter,localEarthRad);
//          
//        if (earthDist < EPSILON){
//            hitWhich = 2;
//            return earthDist;
//        }
//      
//    }
//    
//    vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);//corner of cube in Klein model, useful for horosphere distance function
//    float centerSphereRadius = 1.333 * modelHalfCube;
//    vec4 center = ORIGIN;
//    float sphere = centerSDF(p,  center, centerSphereRad);
//    float vertexSphere = 0.0;
//    vertexSphere = vertexSDF(abs(p), modelCubeCorner, vertexSphereRad);
//    
//    tilingDist = -min(vertexSphere,sphere);
//    
//    distance=min(tilingDist,min(lightDist,earthDist));//unionSDF
//    return distance;
//
//   // float final = -sphere;
//    //return final;
//}



float localSceneSDF(vec4 p){
    float earthDist;
    float tilingDist;
    float lightDist;
    float distance = MAX_DIST;
    
    //Light Objects
 if(LOCAL_LIGHTS){
     vec4 lightCenter=localLightPos;
      lightDist=sphereSDF(p,lightCenter,0.05);
      distance =min(distance, lightDist);
        if (lightDist < EPSILON){
            hitLocal = true;
            hitWhich = 1;
            globalLightColor =vec4(localLightColor,1);
            return lightDist;
        }
 }
    
    if(LOCAL_EARTH){
       //vec4 earthCenter=translate(localEarthBoost,ORIGIN);
       vec4 earthCenter=translate(localEarthBoost,ORIGIN);
       earthDist=sphereSDF(p,earthCenter,0.35);
        distance=min(distance,earthDist);
        if(earthDist < EPSILON){
            hitLocal = true;
            hitWhich = 7;
            return earthDist;
        }  
    }
 if(TILING){
        vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);//corner of cube in Klein model, useful for horosphere distance function
            float centerSphereRadius = 1.333 * modelHalfCube;
            vec4 center = ORIGIN;
            float sphere = centerSDF(p,  center, centerSphereRad);
            float vertexSphere = 0.0;
            vertexSphere = vertexSDF(abs(p), modelCubeCorner, vertexSphereRad);
            tilingDist = -min(vertexSphere,sphere);
            distance=min(distance, tilingDist);
        if(tilingDist < EPSILON){
            hitLocal = true;
            hitWhich=3;
            return tilingDist;
        }
 }
    return distance;
}
    
    
    
















//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene




float globalSceneSDF(vec4 p){
    float earthDist;
    float moonDist;
    float sunDist;
    vec4 absolutep = translate(cellBoost, p);// correct for the fact that we have been moving
    float distance = MAX_DIST;
    //Light Objects
 if(GLOBAL_LIGHTS){
    for (int i=0; i<numLights; i++){
        float objDist;
        objDist = sphereSDF(absolutep,lightPositions[i], 0.1);
        
        distance = min(distance, objDist);
        
        if (distance < EPSILON){
            hitLocal = false;
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }
    }
    //Global Sphere Object
   // float objDist;
    vec4 earthPos=translate(earthBoost, ORIGIN);
    earthDist = sphereSDF(absolutep,earthPos, earthRad);
    distance = min(distance, earthDist);
    if (distance < EPSILON){
        hitLocal = false;
        hitWhich = 2;
    return distance;
    }
    
    
    if(MOON){
        vec4 moonPos=translate(moonBoost, ORIGIN);
        moonDist = sphereSDF(absolutep,moonPos, moonRad);
        distance = min(distance, moonDist);
        if (distance < EPSILON){
            hitLocal = false;
            hitWhich = 4;
        return distance;
        }
    }
    
    if(SUN){
        vec4 sunPos=translate(sunBoost, ORIGIN);
        sunDist = sphereSDF(absolutep,sunPos, sunRad);
        distance = min(distance, sunDist);
        if (distance < EPSILON){
            hitLocal = false;
            hitWhich = 6;
        return distance;
        }
    }
    
    return distance;
}

























//float globalSceneSDF(vec4 p){
//    vec4 absolutep = translate(cellBoost, p);// correct for the fact that we have been moving
//    float distance = MAX_DIST;
//    //Light Objects
//    for (int i=0; i<4; i++){
//        float objDist;
//        objDist = sphereSDF(
//        absolutep,
//        lightPositions[i],
//            0.1
//    //    1.0/(10.0*lightIntensities[i].w)
//        );
//        distance = min(distance, objDist);
//        if (distance < EPSILON){
//            hitWhich = 1;
//            globalLightColor = lightIntensities[i];
//            return distance;
//        }
//    }
//    //Global Sphere Object
//    float objDist;
//    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
//    objDist = sphereSDF(absolutep, globalObjPos, globalSphereRad);
//    distance = min(distance, objDist);
//    if (distance < EPSILON){
//        hitWhich = 2;
//    }
//    return distance;
//}


// check if the given point p is in the fundamental domain of the lattice.
bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    vec4 ModelP= modelProject(p);
    if (ModelP.x > modelHalfCube){
        fixMatrix = Isometry(invGenerators[0]);
        return true;
    }
    if (ModelP.x < -modelHalfCube){
        fixMatrix = Isometry(invGenerators[1]);
        return true;
    }
    if (ModelP.y > modelHalfCube){
        fixMatrix = Isometry(invGenerators[2]);
        return true;
    }
    if (ModelP.y < -modelHalfCube){
        fixMatrix = Isometry(invGenerators[3]);
        return true;
    }
    if (ModelP.z > modelHalfCube){
        fixMatrix = Isometry(invGenerators[4]);
        return true;
    }
    if (ModelP.z < -modelHalfCube){
        fixMatrix = Isometry(invGenerators[5]);
        return true;
    }
    return false;
}



// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
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
    if (hitLocal == false){ //global light scene
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

void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    tangVector testlocaltv = rayDir;
    tangVector bestlocaltv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:

    if(TILING_SCENE){
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
      float localDist = localSceneSDF(localtv.pos);
      if (localDist < EPSILON){
          sampletv = localtv;
          stepsTaken = i;
          break;
      }
      marchStep = localDist;
       
      testlocaltv = flow(localtv, marchStep);
      if (isOutsideCell(testlocaltv, fixMatrix)){
        bestlocaltv = testlocaltv;
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
        totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
        localtv = geomProject(translate(fixMatrix, localtv));
        globalDepth += marchStep; 
        marchStep = MIN_DIST;
      }
      else{ 
          localtv = testlocaltv; 
          globalDepth += marchStep; 
        }
      }
      localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}


    if(GLOBAL_SCENE){
    globalDepth = MIN_DIST;
    marchStep = MIN_DIST;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
        tv = flow(tv, marchStep);

        float globalDist = globalSceneSDF(tv.pos);
        if (globalDist < EPSILON){
            totalFixMatrix = identityIsometry;
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

    if(GLOBAL_LIGHTS){
    for (int i = 0; i<numLights; i++){
        Isometry totalIsom=composeIsometry(totalFixMatrix,invCellBoost);
        TLP = translate(totalIsom,lightPositions[i]);
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    //return color;
}
if(LOCAL_LIGHTS){
    //pick up light from the light source in your fundamental domain
  
       color+= lightingCalculations(SP,localLightPos,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
    
    
    //move local light around by the generators to pick up lighting from nearby cells
    for(int i=0; i<6; i++){
        Isometry localLightIsom=Isometry(invGenerators[i]);
        TLP=translate(localLightIsom,localLightPos);
        color+= lightingCalculations(SP,TLP,V,vec3(1.0),vec4(localLightColor,localLightIntensity)); 
    }
    

}

    if(SUN){
        vec4 sunPos=translate(sunBoost, ORIGIN);
        Isometry totalIsom=composeIsometry(totalFixMatrix,invCellBoost);
        TLP = translate(totalIsom,sunPos);
        color += lightingCalculations(SP, TLP, V, vec3(1.0), vec4(1.,0.9,0.4,1.));
        //first three give color, last gives intensity
}
    
 return color;
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

vec3 sphereOffset(Isometry objectBoost, mat4 objectFacing, vec4 pt){
    if(hitLocal == false){ pt = translate(cellBoost, pt); }
    // pt = inverse(objectBoost.matrix) * pt;
    pt = translate(isometryInverse(objectBoost), pt);
    tangVector earthPoint=tangDirection(ORIGIN,pt);
    earthPoint=rotateFacing(objectFacing, earthPoint);
    return earthPoint.dir.xyz;
}

vec3 sphereTexture(Isometry totalFixMatrix, tangVector sampletv, Isometry sphLocation, mat4 sphFacing, samplerCube sphTexture){
    // vec3 color = vec3(0.5,0.5,0.5);
    vec3 color = texture(sphTexture, sphereOffset(sphLocation, sphFacing, sampletv.pos)).xyz;
    // color = 0.5*color + 0.5*vec3(float(stepsTaken)*0.1, float(stepsTaken-10)*0.1, float(stepsTaken-20)*0.1);
    N = estimateNormal(sampletv.pos);
    vec3 color2 = phongModel(totalFixMatrix, color);
    //color = 0.9*color+0.1;
    return 0.5*color + 0.5*color2;
    return color;
    }

//Code for coloring a sphere with no texture
//N = estimateNormal(sampletv.pos);
//        vec3 color=vec3(0.,0.,0.);
//        color = phongModel(totalFixMatrix, color);
//        color = 0.9*color+0.1;
//        return color;







vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
     if(COLORED_SURFACE){
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
        vec3 color = vec3(x,y,z);
        N = estimateNormal(sampletv.pos);
        color = phongModel(totalFixMatrix, 0.1*color);
        
         
        if(TILING_TEXTURE){
          color *= pow(boxMapping( rockTex, sampletv ),vec3(0.75));
        }
   
        return color;
        //add a small constant makes it glow slightly
     }
    else{//if we are doing TRUE LIGHTING
       // objects have no natural color, only lit by the lights
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0.,0.,0.);
        color = phongModel(totalFixMatrix, color);
     
        if(TILING_TEXTURE){
        color *= pow(boxMapping( rockTex, sampletv ),vec3(0.75));
        }
        
        return color;
        }
}







//--------------------------------------------------------------------
// Tangent Space Functions
//--------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x + stereoScreenOffset * resolution.x; }
        else { fragCoord.x = fragCoord.x - stereoScreenOffset * resolution.x;  }
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

    earthBoost=Isometry(earthBoostMat);
    moonBoost=Isometry(moonBoostMat);
    sunBoost=Isometry(sunBoostMat);
    localEarthBoost=Isometry(localEarthBoostMat);


    //vec4 rayOrigin = ORIGIN;

    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rayDir=rotateFacing(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir=rotateFacing(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }
    else {
        rayDir=rotateFacing(facing, rayDir);
        rayDir = translate(currentBoost, rayDir);
    }



    //generate direction then transform to hyperboloid ------------------------

    //    vec4 rayDirVPrime = tangDirection(rayOrigin, rayDirV);
    //get our raymarched distance back ------------------------
    Isometry totalFixMatrix = identityIsometry;
    raymarch(rayDir, totalFixMatrix);

    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.1);
        return;
    }
    else if (hitWhich == 1){ // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){ //debug
        out_FragColor = vec4(debugColor, 1.0);
    }
    
        else if (hitWhich == 2){ // the earth
            
        vec3 pixelColor=sphereTexture(totalFixMatrix, sampletv, earthBoost, earthFacing, earthCubeTex);
            

        out_FragColor = vec4( pixelColor,1.0);

        return;
    }

    
    else if (hitWhich == 4){ // the moon
            
        vec3 pixelColor=sphereTexture(totalFixMatrix, sampletv,moonBoost, moonFacing, moonCubeTex);
            
        out_FragColor = vec4(pixelColor,1.0);
            
        return;
    }
    
else if (hitWhich == 6){ // the sun
            
        vec3 pixelColor=sphereTexture(totalFixMatrix, sampletv,sunBoost, sunFacing, sunCubeTex);
            
        out_FragColor = vec4(pixelColor,1.0);
            
        return;
    }
    
    
else if (hitWhich == 7){ // the LOCAL earth
        
    //earthBoostNow=composeIsometry(totalFixMatrix,earthBoostNow);
   // vec3 pixelColor=tilingColor(totalFixMatrix,sampletv);
        vec3 pixelColor=sphereTexture(
            totalFixMatrix, sampletv, localEarthBoost, localEarthFacing, earthCubeTex);

        out_FragColor = vec4( pixelColor,1.0);

        return;
    }
    
    



    else { // objects

        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);

        out_FragColor=vec4(pixelColor,1.0);

}

}
