#version 300 es
out vec4 out_FragColor;

/*

Voodoo magic:

A set of parameters that reduces the noise
EPSILON = 0.001;
In the local ray marching use
localDist = min(1., localSceneSDF(localtv.pos));


*/

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


const bool FAKE_LIGHT_FALLOFF=true;
const bool FAKE_LIGHT = true;
const bool FAKE_DIST_SPHERE = false;


//const float globalObjectRadius = 0.4;
const float centerSphereRadius =0.67;
const float vertexSphereSize = 0.23;//In this case its a horosphere

//----------------------------------------------------------------------------------------------------------------------
// "TRUE" CONSTANTS
//----------------------------------------------------------------------------------------------------------------------

const float PI = 3.1415926538;
const float GoldenRatio = 0.5*(1.+sqrt(5.));//1.618033988749895;
const float z0 = 0.9624236501192069;// 2 * ln( golden ratio)
const float sqrt3 = 1.7320508075688772;

const vec4 ORIGIN = vec4(0, 0, 0, 1);

vec3 debugColor = vec3(0.5, 0, 0.8);

//----------------------------------------------------------------------------------------------------------------------
// Global Constants
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;


//void setResolution(float UIVar){
//    if (UIVar==1){
//        MAX_MARCHING_STEPS =  50;
//        MAX_DIST = 100.0;
//    }
//    if (UIVar==2){
//        MAX_MARCHING_STEPS =  100;
//        MAX_DIST = 300.0;
//
//    }
//    if (UIVar==3){
//        MAX_MARCHING_STEPS =  250;
//        MAX_DIST = 600.0;
//
//    }
//}


void setResolution(float UIVar){
    //UIVar goes between 0 for low res and 1 for high res
        MAX_MARCHING_STEPS =  int(50.+200.*UIVar);
        MAX_DIST = 100.+400.*UIVar;
   
}




//const float EPSILON = 0.0001;
const float EPSILON = 0.0005;
const float fov = 120.0;










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
uniform float lightRad;

uniform int display;
// 1=tiling
// 2= planes

uniform float res;

//tiling generator vectors
uniform vec4 V1;
uniform vec4 V2;
uniform vec4 V3;

//adding one local light (more to follow)
vec4 localLightPos=vec4(0.1, 0.1, -0.2, 1.);
vec4 localLightColor=vec4(1., 1., 1., 0.2);

//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);


int hitWhich=0;




