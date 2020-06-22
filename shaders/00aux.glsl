#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

const bool FAKE_LIGHT = false;
const bool SURFACE_COLOR=true;
const bool FAKE_DIST_SPHERE = false;
const float globalObjectRadius = 0.;
const bool LOCAL_EARTH=true;
const bool TILING=false;
const bool GLOBAL_EARTH=false;

//local lights only on without the tiling: they help with definition on the earth but wash out the tiling
const bool LOCAL_LIGHTS=false;
const bool RENDER_LOCAL_LIGHTS=false;
float localLightIntensity=0.25;
//!TILING;
//bool hitLocal;


//--------------------------------------------
// "TRUE" CONSTANTS
//--------------------------------------------

const float PI = 3.1415926538;

const vec4 ORIGIN = vec4(0, 0, 0, 1);
const float modelHalfCube = 0.5;


/*
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
*/


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

/*

Compute the zeros between 0 and 2*PI of the function f given below
Usefull for the methods
- tangDirection
- exactDistance

*/

const int MAX_NEWTON_INIT_ITERATION = 1000;
const int MAX_NEWTON_ITERATION = 1000;
const float MAX_NEWTON_INIT_TOLERANCE = 0.001;
const float NEWTON_TOLERANCE = 0.0001;


// the function f whose zeros need to be found
float f(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return rhosq * (phi - sin(phi)) - 8.0 * (x3 - phi) * pow(sin(0.5 * phi), 2.0);
}

// the derivative of f (with respect to phi)
float df(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return 2.0 * sin(0.5 * phi) * (rhosq + 4.0) * sin(0.5 * phi) - 4.0 * (x3 -phi) * cos(0.5 * phi);
}

// the second derivative of f (with respect to phi)
float d2f(float rhosq, float x3, float phi){
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates
    return (rhosq + 8.0) * sin(phi) - 4.0 * (x3 - phi) * cos(phi);
}

// rough zero, to start newton method (with a check on convexity)
float newton_init(float rhosq, float x3) {
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates

    if (x3 < PI) {
        // if x3 < pi, x3 is a good start for the Newthon method
        return x3;
    }
    else {
        // if x3 > pi, do a dichotomy to find the best start
        float phi0 = 0.0;
        float d20 = d2f(rhosq, x3, phi0);
        float phi1 = min(2.0 * PI, x3);
        float d21 = d2f(rhosq, x3, phi1);

        for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++) {
            // step of the dichotomy
            float phi_aux = 0.5 * phi0 + 0.5 * phi1;
            float val = f(rhosq, x3, phi_aux);
            float d2_aux = d2f(rhosq, x3, phi_aux);
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
float newton_zero(float rhosq, float x3) {
    // - rhosq is the square the the radius in cylindrical coordinates
    // - x3 is the height in the cylindrical coordinates

    float phi = newton_init(rhosq, x3);
    float val = f(rhosq, x3, phi);
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        if (abs(val) < NEWTON_TOLERANCE){
            return phi;
        }
        phi = phi - val/df(rhosq, x3, phi);
        val = f(rhosq, x3, phi);
    }
    return phi;
}

