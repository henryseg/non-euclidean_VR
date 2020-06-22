//--------------------------------------------
//Global Constants
//--------------------------------------------
const int MAX_MARCHING_STEPS =  200;
const float MIN_DIST = 0.0;
const float MAX_DIST = 10.0;
const float EPSILON = 0.0001;
const float fov = 110.0;
const float sqrt3 = 1.7320508075688772;


//--------------------------------------------
//Global Variables
//--------------------------------------------
tangVector N = tangVector(ORIGIN, vec4(0., 0., 0., 1.));//normal vector
tangVector sampletv = tangVector(vec4(1., 1., 1., 1.), vec4(1., 1., 1., 0.));
vec4 globalLightColor = vec4(1.,1.,1.,1.);
int hitWhich = 0;

vec3 localLightColor=vec3(1.,1.,1.);
vec4 localLightPos=vec4(0.0,0.4,-0.2,1.);

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
uniform mat4 localEarthFacing;
//--------------------------------------------
// Lighting Variables & Global Object Variables
//--------------------------------------------
uniform vec4 lightPositions[4];
uniform vec4 lightIntensities[4];
uniform mat4 globalObjectBoost;
uniform mat4 localEarthBoost;
uniform mat4 globalEarthBoost;