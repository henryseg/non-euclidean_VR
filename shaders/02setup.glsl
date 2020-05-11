

//Voodoo magic:
//
//A set of parameters that reduces the noise
//EPSILON = 0.001;
//In the local ray marching use
//localDist = min(1., localSceneSDF(localtv.pos));
//
//
//

//----------------------------------------------------------------------------------------------------------------------
// PARAMETERS
//----------------------------------------------------------------------------------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

//determine what we draw: ball and lights, 
const bool GLOBAL_SCENE=true;
const bool TILING_SCENE=true;
const bool EARTH=false;


const bool FAKE_LIGHT_FALLOFF=true;
const bool FAKE_LIGHT = true;
const bool FAKE_DIST_SPHERE = false;

//----------------------------------------------------------------------------------------------------------------------
// "TRUE" CONSTANTS
//----------------------------------------------------------------------------------------------------------------------

const float PI = 3.1415926538;
//const float GoldenRatio = 0.5*(1.+sqrt(5.));//1.618033988749895;
//const float z0 = 0.9624236501192069;// 2 * ln( golden ratio)
const float sqrt3 = 1.7320508075688772;


const vec4 ORIGIN = vec4(0, 0, 0, 1);

vec3 debugColor = vec3(0.5, 0, 0.8);

//----------------------------------------------------------------------------------------------------------------------
// Global Constants
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
int MAX_REFL_STEPS;
const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;



void setResolution(float UIVar){
    //UIVar goes between 0 for low res and 1 for high res
        MAX_MARCHING_STEPS =  int(50.+200.*UIVar);
        MAX_REFL_STEPS= int(10.+60.*UIVar);
        MAX_DIST = 100.+400.*UIVar;
   
}




//const float EPSILON = 0.0001;
const float EPSILON = 0.0005;
const float fov = 120.0;


//distance to viewer when a raymarch step ends
float distToViewer;








//----------------------------------------------------------------------------------------------------------------------
// Translation & Utility Variables
//----------------------------------------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------------------------------------
// Lighting Variables & Global Object Variables
//----------------------------------------------------------------------------------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoostMat;
uniform float globalSphereRad;
uniform samplerCube earthCubeTex;
uniform float time;
uniform float brightness;

uniform int display;
// 1=tiling
// 2= planes

uniform float res;

uniform float mirror;

//tiling generator vectors
uniform vec4 V1;
uniform vec4 V2;
uniform vec4 V3;

uniform vec4 currentPosVec;



//lightRad controls the intensity of the light
//it is allowed to run from 0 to 0.5 currently, we will double that for brightness
vec4 localLightColor=vec4(.8,.8,.8,0.5);


//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);


int hitWhich=0;


//position you are at
vec4 currentPos=ORIGIN;
//position of the local light source
vec4 localLightPos=ORIGIN;









//----------------------------------------------------------------------------------------------------------------------
// Initializing Variables Built from Uniforms
//----------------------------------------------------------------------------------------------------------------------



void setVariables(){
    
    currentBoost=Isometry(currentBoostMat);
    currentPos=currentBoostMat*ORIGIN;

    
    localLightPos=ORIGIN+vec4(0.15*sin(2.*time/3.),0.15*cos(3.*time/5.),0.15*sin(time),0.);
    //if instead you want it to follow you around
    //localLightPos=currentPos+vec4(0.05*sin(time/2.),0.05*cos(time/3.),0.05*sin(time),0.);
    
    leftBoost=Isometry(leftBoostMat);
    rightBoost=Isometry(rightBoostMat);
    cellBoost=Isometry(cellBoostMat);
    invCellBoost=Isometry(invCellBoostMat);
    globalObjectBoost=Isometry(globalObjectBoostMat);
    }


















//Designed by IQ to make quick smooth minima
//found at http://www.viniciusgraciano.com/blog/smin/

// Polynomial smooth minimum by iq
//float smin(float a, float b, float k) {
//  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
//  return mix(a, b, h) - k*h*(1.0-h);
//}
//
//float smax(float a, float b, float k) {
//  return -smin(-a,-b,k);
//}