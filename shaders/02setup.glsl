

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

//determine what we draw: ball and lights, 
const bool GLOBAL_SCENE=true;
const bool TILING_SCENE=true;
//do we render a textured earth in the global scene
const bool EARTH=false;

//do lights fall off with area of geodesic sphere, or artifically?
const bool FAKE_LIGHT_FALLOFF=false;
const bool FAKE_LIGHT = true;


//----------------------------------------------------------------------------------------------------------------------
// "TRUE" CONSTANTS
//----------------------------------------------------------------------------------------------------------------------

const float PI = 3.1415926538;
//const float GoldenRatio = 0.5*(1.+sqrt(5.));//1.618033988749895;
//const float z0 = 0.9624236501192069;// 2 * ln( golden ratio)
const float sqrt3 = 1.7320508075688772;

//the origin of the model for this geometry
const vec4 ORIGIN = vec4(0, 0, 0, 1);

vec3 debugColor = vec3(0.5, 0, 0.8);





//----------------------------------------------------------------------------------------------------------------------
// Global Constants for the Raymarch
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
int MAX_REFL_STEPS=50;

const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;
float MAX_REFL_DIST=100.;
//distance to viewer when a raymarch step ends
float distToViewer;

//tolerance for how close you raymarch to the surface
const float EPSILON = 0.0005;
//field of view projected on the screen
//90 is normal, 120 is wide angle
const float fov = 90.0;

//this function resets the constants above in terms of the uniforms; its called in main
void setResolution(float UIVar){
    //UIVar goes between 0 for low res and 1 for high res
        MAX_MARCHING_STEPS =  int(50.+200.*UIVar);
        MAX_DIST = 100.+400.*UIVar;
    
        MAX_REFL_STEPS= int(10.+60.*UIVar);
        MAX_REFL_DIST=50.+50.*UIVar;
   
}





//----------------------------------------------------------------------------------------------------------------------
// Display Variables
//----------------------------------------------------------------------------------------------------------------------

uniform int isStereo;
uniform vec2 screenResolution;
uniform float time;
//resolution: how far we raymarch
uniform float res;

//----------------------------------------------------------------------------------------------------------------------
// Position & Facing Variables
//----------------------------------------------------------------------------------------------------------------------

uniform mat4 currentBoostMat;
uniform mat4 leftBoostMat;
uniform mat4 rightBoostMat;
//current position as a point in the model space
//uniform vec4 currentPosVec;

uniform mat4 facing;
uniform mat4 leftFacing;
uniform mat4 rightFacing;




//----------------------------------------------------------------------------------------------------------------------
// Local Scene
//----------------------------------------------------------------------------------------------------------------------

// keeping track of your location in the tiling
uniform mat4 cellBoostMat;
uniform mat4 invCellBoostMat;

//vector directions (length & angle in tangent space) for tiling generators
uniform vec4 V1;
uniform vec4 V2;
uniform vec4 V3;

//matrix generators of the tiling (as isometries)
uniform mat4 invGenerators[6];



//toggle between which global scene to display
uniform int display;
// 1=tiling by deleted spheres
// 2= tiling by tubes
// 3=lattice of spheres


//----------------------------------------------------------------------------------------------------------------------
// Global Scene
//----------------------------------------------------------------------------------------------------------------------

uniform mat4 globalObjectBoostMat;
uniform float globalSphereRad;




//----------------------------------------------------------------------------------------------------------------------
// Lighting
//----------------------------------------------------------------------------------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform float brightness;

//THESE SHOULD BE REMOVED FROM THE CODE
//it is allowed to run from 0 to 0.5 currently, we will double that for brightness
vec4 localLightColor=vec4(.8,.8,.8,0.5);

//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);



//----------------------------------------------------------------------------------------------------------------------
// Material Properties
//----------------------------------------------------------------------------------------------------------------------

//load texture for the earth
uniform samplerCube earthCubeTex;

//how reflective are mirrored surfaces?
uniform float mirror;









//----------------------------------------------------------------------------------------------------------------------
// Initializing Variables Built from Uniforms
//----------------------------------------------------------------------------------------------------------------------

//initialize the counter which tells which material was hit in the raymarch
int hitWhich=0;
//the counter which tells you if what you hit was local or global
int isLocal=0;


//position you are at
vec4 currentPos=ORIGIN;
//position of the local light source
vec4 localLightPos=ORIGIN;

// variable that tracks the resulting color of a point after being hit by raymarch
vec4 resultingColor;
// tracking the color after a reflected march
vec4 reflectedColor;



//make it  so there's a bubble around your head
//this constant tells you how far to march out along rayDir.tv before starting the trace
//used in  raymarch
float START_MARCH=0.2;

//this constant tells you what portion of the reported distance you are willing to march
//used in raymarch
float marchProportion=0.95;


//this runs in main to set all the variables computed from the uniforms / constants above
void setVariables(){
    
    currentBoost=Isometry(currentBoostMat);
    currentPos=currentBoostMat*ORIGIN;

    
    //localLightPos=ORIGIN+vec4(0.15*sin(2.*time/3.),0.15*cos(3.*time/5.),0.15*sin(time),0.);
    //if instead you want it to follow you around
    localLightPos=currentPos+vec4(0.05*sin(time/2.),0.05*cos(time/3.),0.05*sin(time),0.);
    
    leftBoost=Isometry(leftBoostMat);
    rightBoost=Isometry(rightBoostMat);
    cellBoost=Isometry(cellBoostMat);
    invCellBoost=Isometry(invCellBoostMat);
    globalObjectBoost=Isometry(globalObjectBoostMat);
    }













