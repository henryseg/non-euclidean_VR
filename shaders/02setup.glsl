

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
// PARAMETERS FOR THE SCENE
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

//the origin of H2xR
const vec4 ORIGIN = vec4(0., 0., 1, 0.);

vec3 debugColor = vec3(0.5, 0, 0.8);





//----------------------------------------------------------------------------------------------------------------------
// Global Constants for the Raymarch
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
int MAX_REFL_STEPS=50;
int MAX_SHADOW_STEPS=20;

const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;
float MAX_REFL_DIST=100.;

//make it  so there's a bubble around your head
//this constant tells you how far to march out along rayDir.tv before starting the trace
//used in  raymarch
float START_MARCH=0.2;

//this constant tells you what portion of the reported distance you are willing to march
//used in raymarch
float marchProportion=0.95;


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
    
        MAX_REFL_STEPS= int(30.+60.*UIVar);
        MAX_REFL_DIST=50.+50.*UIVar;
        //MAX_SHADOW_STEPS=int(20.+30.*UIVar);
   
}





//----------------------------------------------------------------------------------------------------------------------
// GLOBAL VARIABLES SET BY THE RAYMARCH /SDFS, and things built from them
//----------------------------------------------------------------------------------------------------------------------


float distToViewer;//distance to viewer when a raymarch step ends
tangVector sampletv;//final unit tangent vector to geodesic at end of raymarch
int hitWhich=0;//the counter which tells which material was hit in the raymarch
bool hitLocal;//the counter which tells you if what you hit was local or global


//other ones we construct
vec4 surfacePosition;//the position vector sampletv.pos
tangVector toViewer;//the tangent vector turnAround(sampletv) pointing from the surface back to the viewer
tangVector surfNormal;//the unit normal to the surface at surfacePosition







//----------------------------------------------------------------------------------------------------------------------
// OTHER GLOBAL VARIABLES
//----------------------------------------------------------------------------------------------------------------------


Isometry identityIsometry=Isometry(mat4(1.0),vec4(0.));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;
Isometry totalFixMatrix;
Isometry invGenerators[6];

//position you are at
vec4 currentPos=ORIGIN;











//----------------------------------------------------------------------------------------------------------------------
// Display Variables
//----------------------------------------------------------------------------------------------------------------------

uniform int isStereo;//if display should be stereo
uniform vec2 screenResolution;//resolution of display
uniform float time;//passes computer clock time for animating objects

uniform float res;//resolution: how far we raymarch




//----------------------------------------------------------------------------------------------------------------------
// Position & Facing Variables
//----------------------------------------------------------------------------------------------------------------------

uniform mat4 currentBoostMat;
uniform vec4 currentBoostReal;//changed this

uniform mat4 leftBoostMat;
uniform vec4 leftBoostReal;//changed this

uniform mat4 rightBoostMat;
uniform vec4 rightBoostReal;//changed this
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
uniform vec4 cellBoostReal;//changed this

uniform mat4 invCellBoostMat;
uniform vec4 invCellBoostReal;//changed this


//normal vector to faces in the affine model fundamental domain
uniform vec3 nV[3];
//face pairing in affine model fundamental domain
uniform vec3 pV[3];

//matrix generators of the tiling (as isometries)
uniform mat4 invGeneratorsMatrices[6];
uniform vec4 invGeneratorsReals[6];//changed this

//toggle between which global scene to display
uniform int display;
// 1=tiling by deleted spheres
// 2= tiling by tubes
// 3=lattice of spheres


uniform float yourRad;//radius of the local object sphere representing "you"
uniform int quality;

//----------------------------------------------------------------------------------------------------------------------
// Global Scene
//----------------------------------------------------------------------------------------------------------------------

uniform mat4 globalObjectBoostMat;
uniform vec4 globalObjectBoostReal;//changed this
uniform float globalSphereRad;




//----------------------------------------------------------------------------------------------------------------------
// Lighting
//----------------------------------------------------------------------------------------------------------------------

uniform vec4 localLightPosition;

uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform float brightness;
uniform bool renderShadow;

vec3 colorOfLight;//variable which sets the light colors for drawing in hitWhich 1

vec4 localLightPos;//not passed as a uniform right now; set below in setVariables
float localLightBrightness;//gives the brightness of the local light source, computed in setVariables


//THIS SHOULD BE REMOVED FROM THE CODE
//And instead passed as a uniform
vec3 localLightColor=vec3(1.,1.,1.);





//----------------------------------------------------------------------------------------------------------------------
// Material Properties
//----------------------------------------------------------------------------------------------------------------------

//load texture for the earth
uniform samplerCube earthCubeTex;

//how reflective are mirrored surfaces?
uniform float mirror;
float surfRefl;




//----------------------------------------------------------------------------------------------------------------------
// SHADING VARIABLES
//----------------------------------------------------------------------------------------------------------------------


bool firstPass;//set to be true on the first pass through raymarching,  and false for future passes
//this way, we may look at the value of firstPass to determine if we should cut corners with the raymarch or not.

// variable that tracks the resulting color of a point after being hit by raymarch
vec4 resultingColor;
// tracking the color after a reflected march
vec4 reflectedColor;















//----------------------------------------------------------------------------------------------------------------------
// Initializing Variables Built from Uniforms
//----------------------------------------------------------------------------------------------------------------------



//this runs in main to set all the variables computed from the uniforms / constants above
void setVariables(){
    
    //if this isn't going to work...need to make a list of these things some other way.
   Isometry iG0=Isometry(invGeneratorsMatrices[0],invGeneratorsReals[0]);
    Isometry iG1=Isometry(invGeneratorsMatrices[1],invGeneratorsReals[1]);
   Isometry iG2=Isometry(invGeneratorsMatrices[2],invGeneratorsReals[2]);
    Isometry iG3=Isometry(invGeneratorsMatrices[3],invGeneratorsReals[3]);
    Isometry iG4=Isometry(invGeneratorsMatrices[4],invGeneratorsReals[4]);
   Isometry iG5=Isometry(invGeneratorsMatrices[5],invGeneratorsReals[5]);
    
    invGenerators=Isometry[6](iG0,iG1,iG2,iG3,iG4,iG5);
    
//    
//    invGenerators=Isometry[6](Isometry(invGeneratorsMatrices[0],invGeneratorsReals[0]),
//        Isometry(invGeneratorsMatrices[1],invGeneratorsReals[1]),
//        Isometry(invGeneratorsMatrices[2],invGeneratorsReals[2]),
//        Isometry(invGeneratorsMatrices[3],invGeneratorsReals[3]),  
//        Isometry(invGeneratorsMatrices[4],invGeneratorsReals[4]), 
//        Isometry(invGeneratorsMatrices[5],invGeneratorsReals[5]));
        
    currentBoost=Isometry(currentBoostMat,currentBoostReal);

    currentPos=translate(currentBoost,ORIGIN);
    
    //set our light with the new uniform
    localLightPos=localLightPosition;
    
    //localLightPos=ORIGIN+vec4(0.25*sin(2.*time/6.),0.25*cos(3.*time/10.),0.25*sin(time/2.),0.);
    //if instead you want it to follow you around
    //localLightPos=currentPos+vec4(0.05*sin(time/2.),0.05*cos(time/3.),0.05*sin(time),0.);
    
    localLightBrightness=6.+5.*brightness*brightness;
    
    leftBoost=Isometry(leftBoostMat,leftBoostReal);
    rightBoost=Isometry(rightBoostMat,rightBoostReal);
    cellBoost=Isometry(cellBoostMat,currentBoostReal);
    invCellBoost=Isometry(invCellBoostMat,invCellBoostReal);
    globalObjectBoost=Isometry(globalObjectBoostMat,globalObjectBoostReal);
    }













