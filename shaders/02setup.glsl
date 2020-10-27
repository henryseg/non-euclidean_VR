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



const bool FAKE_LIGHT_FALLOFF=false;
const bool FAKE_LIGHT = false;


//const float globalObjectRadius = 0.4;
//const float centerSphereRadius =0.67;
//const float modelHalfCube = 0.5;

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
int MAX_MARCHING_STEPS =  400;
const float MIN_DIST = 0.0;
float MAX_DIST = 200.0;


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
bool isLocal=true;








//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
Vector N;//normal vector
Vector sampletv;
vec4 globalLightColor;
Isometry currentBoost;
//Isometry leftBoost;
//Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;


Isometry gens[11];
int numGens;

Point surfacePosition;
Vector toLight;
Vector atLight;
Vector toViewer;
Vector surfNormal;
float surfRefl;
Isometry totalFixIsom;
float distToViewer;
float distToLight;

//----------------------------------------------------------------------------------------------------------------------
// Translation & Utility Variables
//----------------------------------------------------------------------------------------------------------------------
//uniform int isStereo;
uniform vec2 screenResolution;
uniform vec4 invGenerators[10];//
uniform vec4 currentBoostMat;
//uniform vec4 leftBoostMat;
//uniform vec4 rightBoostMat;
uniform mat4 facing;
//uniform mat4 leftFacing;
//uniform mat4 rightFacing;
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
uniform float refl;
uniform float foggy;
uniform int planes;

uniform int display;
//1=CorrLight;
//2=ConstIntensity;
//3=NoLight

uniform int resol;

//adding one local light (more to follow)
Point localLightPos;
vec4 localLightColor=vec4(1., 1., 1., 0.2);

//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);


//----------------------------------------------------------------------------------------------------------------------
// Re-packaging isometries, facings in the shader
//----------------------------------------------------------------------------------------------------------------------

Point lP1;
Point lP2;
Point lP3;
Point lP4;


void setVariables(){
     
   totalFixIsom=identity;
    currentBoost = unserializeIsom(currentBoostMat);
//    leftBoost = unserializeIsom(leftBoostMat);
//    rightBoost = unserializeIsom(rightBoostMat);
    cellBoost = unserializeIsom(cellBoostMat);
    invCellBoost = unserializeIsom(invCellBoostMat);
    globalObjectBoost = unserializeIsom(globalObjectBoostMat);

    localLightPos = fromVec4(vec4(0., 0., 1., 0.));
      //  vec4(0.5, 0.5, -0.71, 1.));
      
      lP1=fromVec4(vec4(0.,0,1,0.5));
lP2=fromVec4(vec4(0,0,1,0));
lP3=fromVec4(vec4(1,0,1.41,0));
lP4=fromVec4(vec4(0,1,1.41,0));
}

