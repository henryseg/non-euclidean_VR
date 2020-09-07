#version 300 es
out vec4 out_FragColor;

//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

const bool FAKE_LIGHT = false;
const int MAX_DIRS_LIGHT = 3;
const bool SURFACE_COLOR = true;
const bool FAKE_DIST_SPHERE = true;
const float globalObjectRadius = 0.;
const bool LOCAL_EARTH = false;
const bool TILING = false;
const bool GLOBAL_EARTH = true;

//local lights only on without the tiling: they help with definition on the earth but wash out the tiling
const bool LOCAL_LIGHTS = false;
const bool RENDER_LOCAL_LIGHTS = false;
float localLightIntensity = 0.25;
//!TILING;
//bool hitLocal;


//--------------------------------------------
// "TRUE" CONSTANTS
//--------------------------------------------

const float PI = 3.1415926538;

//const vec4 ORIGIN = vec4(0, 0, 0, 1);
const float modelHalfCube = 0.5;

vec3 debugColor = vec3(0.5, 0, 0.8);


//-------------------------------------------------------
// AUXILIARY (NEWTON METHOD)
//-------------------------------------------------------


const int MAX_NEWTON_INIT_ITERATION = 50;
const int MAX_NEWTON_ITERATION = 50;
const float NEWTON_INIT_TOLERANCE = 0.001;
const float NEWTON_TOLERANCE = 0.0001;


// AUXILIARY COMPUTATION TO
// - COMPUTE THE EXACT DISTANCE
// - COMPUTE THE DIRECTION OF THE SHORTEST GEODESIC FROM THE ORIGIN TO A GIVEN POINT


// Auxiliary function.
// The geodesics joining to origin to the point with cylindrical coordiantes (rho, *,z)
// are in one-to-one correspondance with the zeros of chi (see paper)
// We pass the argument rho as rho^2
float chi(float rhoSq, float z, float phi) {
    float res = -z + phi;

    if (phi < 0.001) {
        // when phi is close to zero we replace the next term by an asymptotic expansion
        float phi2 = phi * phi;
        float phi4 = phi2 * phi2;
        res = res + rhoSq * phi * (phi2 + 30.) * (phi4 + 840.) / 302400.;
    }
    else {
        float sPhiOver2 = sin(0.5 * phi);
        res = res + rhoSq * (phi - sin(phi)) / (8. * sPhiOver2 * sPhiOver2);
    }
    return res;
}

// Derivative of chi
float dchi(float rhoSq, float z, float phi) {
    float res = 1.;

    if (phi < 0.001) {
        // when phi is close to zero we replace the next term by an asymptotic expansion
        float phi2 = phi * phi;
        float phi4 = phi2 * phi2;
        float phi6 = phi4 * phi2;
        res = res + rhoSq * (25200. + 2520. * phi2 + 150. * phi4 + 7. * phi6) / 302400.;
    }
    else {
        float cPhi = cos(0.5 * phi);
        float sPhi = sin(0.5 * phi);
        res =  res - rhoSq * (phi * cPhi - 2. * sPhi) / (8. * sPhi * sPhi * sPhi);
    }
    return res;
}


// initialization of the Newthon method to find the zeros of chi
// we look for a value of phi such that
// * phiMin < phi < phiMax
// * chi(phi) > 0
// * dchi(phi) has the same as s
float zero_chi_init(float rhoSq, float z, float phiMin, float phiMax, float s) {
    float bdy;
    if (s > 0.) {
        bdy = phiMax;
    }
    else {
        bdy = phiMin;
    }
    float aux = 0.5 * phiMin + 0.5 * phiMax;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        if (sign(dchi(rhoSq, z, aux)) == s && chi(rhoSq, z, aux) > 0.) {
            break;
        }
        aux = 0.5 * aux + 0.5 * bdy;
    }
    return aux;
}


// find a zero phi of chi such that
// * phiMin < phi < phiMax
// * chi(phi) = 0 (of course !)
// * dchi(phi) has the same as s
// Use the Newton method.
// if such a zero is found return true and update the value of phi
// otherwise return false
bool zero_chi(float rhoSq, float z, float phiMin, float phiMax, float s, out float phi) {
    float aux = -1.;
    phi = zero_chi_init(rhoSq, z, phiMin, phiMax, s);
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        // backup of the previous value of phi
        aux = phi;
        // new value of phi
        phi = phi - chi(rhoSq, z, phi) / dchi(rhoSq, z, phi);
        if (phi < phiMin || phi > phiMax) {
            return false;
        }
        if (sign(dchi(rhoSq, z, phi)) != s) {
            return false;
        }
        if (abs(phi - aux) < NEWTON_TOLERANCE) {
            return true;
        }
    }
    return false;
}