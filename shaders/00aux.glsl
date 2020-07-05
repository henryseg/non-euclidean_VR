#version 300 es
out vec4 out_FragColor;


//--------------------------------------------
// PARAMETERS
//--------------------------------------------

/*

Some parameters that can be changed to change the scence

*/

const bool FAKE_LIGHT = true;
const bool SECOND_DIR_LIGHT = false;
const bool THIRD_DIR_LIGHT = false;
const bool SURFACE_COLOR = true;
const bool FAKE_DIST_SPHERE = false;
const float globalObjectRadius = 0.;
const bool LOCAL_EARTH = true;
const bool TILING = false;
const bool GLOBAL_EARTH = false;

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


const int MAX_NEWTON_INIT_ITERATION = 10;
const int MAX_NEWTON_ITERATION = 10;
const float NEWTON_INIT_TOLERANCE = 0.001;
const float NEWTON_TOLERANCE = 0.0001;


// AUXILIARY COMPUTATION TO
// - COMPUTE THE EXACT DISTANCE
// - COMPUTE THE DIRECTION OF THE SHORTEST GEODESIC FROM THE ORIGIN TO A GIVEN POINT

// consider a geodesic gamma from the origin describing an angle phi
// when reaching the point at distance rho of the axis (O,z)
// return the value of z - z0, where z is the height of gamma at that point
// the distance rho is pased as rho^2
// we assume that z0 is **positive**
float _height(float rhosq, float z0, float phi) {
    float aux;
    // when phi is close to zero we replace the exact formula by an asymptotic expansion
    if (phi < 0.001) {
        float phi2 = phi * phi;
        float phi3 = phi * phi2;
        float phi5 = phi3 * phi2;
        float phi7 = phi5 * phi2;
        aux = (1./12.) * (rhosq + 12.) * phi
        + (1. / 360.) * rhosq * phi3
        + (1. / 10080.) * rhosq * phi5
        + (1. / 302400.) * rhosq * phi7;
    }
    else {
        aux = phi + 0.5 * rhosq * (phi - sin(phi)) / pow(2. * sin(0.5 * phi), 2.0);
    }
    return aux - z0;
}

// derivative of _height with respect to phi
float _dheight(float rhosq, float z0, float phi) {
    float res;
    // when phi is close to zero we replace the exact formular by an asymptotic expansion
    if (phi < 0.001) {
        float phi2 = phi * phi;
        float phi4 = phi2 * phi2;
        float phi6 = phi4 * phi2;
        res = 1. + (1./12.) * rhosq
        + (1. / 120.) * rhosq * phi2
        + (1. / 2016.) * rhosq * phi4
        + (1. / 43200.) * rhosq * phi6;
    }
    else {
        float sinPhiOver2SQ = pow(sin(0.5 * phi), 2.);
        float tanPhiOver2 = tan(0.5 * phi);
        res =  1. + 0.25 * rhosq * (1. - 0.5 * phi / tanPhiOver2) / sinPhiOver2SQ;
    }
    return res;
}


// return a value of phi between phimin and phimax such that _height
// (seen as a function of phi) is positive
// this value will serve as starting point for the newtown method
// the output is found using a binary search
// we assume that _height is defined and monotone on the whole interval (phimin, phimax)
// the boolean `increasing` says if it is increasing or decreasing
float _height_newton_init(float rhosq, float z0, float phimin, float phimax, bool increasing) {
    float auxmin = phimin;
    float auxmax = phimax;
    float aux, val;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        aux = 0.5 * auxmin + 0.5 * auxmax;
        val = _height(rhosq, z0, aux);
        if (val >= 0.) {
            break;
        }
        else {
            if (increasing) {
                auxmin = aux;
            }
            else {
                auxmax = aux;
            }
        }
    }
    return aux;
}

// runs the newton algorithm to find the zero of _height
// starting from phi0
float _height_newton(float rhosq, float z0, float phi0) {
    float phi = phi0;
    float aux;
    float val;
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        // value of _height at phi
        val = _height(rhosq, z0, phi);
        // backup of the previous value of phi
        aux = phi;
        // new value of phi
        phi = phi - val/_dheight(rhosq, z0, phi);
        if (abs(phi - aux) < NEWTON_TOLERANCE) {
            break;
        }
    }
    return phi;
}

/*
// runs the newton algorithm to find the zero of _height
// starting from phi0
// OLD VERSION : bad stopping condition, when _height is 'flat' around its zero.
float _height_newton(float rhosq, float z0, float phi0) {
    float phi = phi0;
    float val = _height(rhosq, z0, phi);

    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        if (abs(val) < NEWTON_TOLERANCE) {
            break;
        }
        else {
            phi = phi - val/_dheight(rhosq, z0, phi);
            val = _height(rhosq, z0, phi);
        }
    }
    return phi;
}
*/

// return the first zero of _height (seen as a function of phi)
// - use the Newton method
// - the starting point of the Newton method is obtained via a binary search
float zero_height(float rhosq, float z0) {
    float phi0 = _height_newton_init(rhosq, z0, 0., 2. * PI, true);
    return _height_newton(rhosq, z0, phi0);
}


// AUXILIARY COMPUTATION TO
// - COMPUTE THE DIRECTION OF THE OTHER GEODESIC FROM THE ORIGIN TO A GIVEN POINT

// The first task is to check whether or not there are more than one geodesics from the orgin to the point
// To that end, we need to check whether _height has a zero between 2pi and 4pi
// More precisely we compute the minimum of _height on the interval [2pi, 4pi]

// "numerator" of _dheight
// _dheight vanishes at phi if and only if so does _aux_dheight
// however _aux_dheight need not have the same sign as _dheight
float _aux_dheight(float rhosq, float z0, float phi) {
    float res;
    if (phi < 0.001){
        float phi2 = phi * phi;
        float phi3 = phi * phi2;
        float phi5 = phi3 * phi2;
        float phi7 = phi5 * phi2;
        res = (1. / 96.) * (rhosq + 12.) * phi3
        + (1./ 3840.) * (rhosq + 60.) * phi5
        + (1./ 430080.) * (rhosq + 364.) * phi7;
    }
    else {
        res = 0.25 * rhosq * (sin(0.5 * phi) - 0.5 * phi * cos(0.5 * phi)) + pow(sin(0.5 * phi), 3.);
    }
    return res;
}
// derivative of _aux_dheight with respect to phi
float _daux_dheight(float rhosq, float z0, float phi) {
    float res;
    res = (1. / 16.) * (phi * rhosq + 12. * sin(phi)) * sin(0.5 * phi);
    return res;
}

// return a first approximation of the zero of _aux_dheight
// using a binary search
// note that _aux_dheight is decreasing on [2pi, 4pi]
float _aux_dheight_newton_init(float rhosq, float z0) {
    float auxmin = 2. * PI;
    float auxmax = 4. * PI;
    float aux, val;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        if (auxmax - auxmin < NEWTON_INIT_TOLERANCE) {
            break;
        }
        aux = 0.5 * auxmin + 0.5 * auxmax;
        val = _aux_dheight(rhosq, z0, aux);
        if (val >= 0.) {
            auxmin = aux;
        }
        else {
            auxmax = aux;
        }
    }
    return aux;
}


// runs the newton algorithm to find the zero of _aux_dheight
// starting from phi0
float _aux_dheight_newton(float rhosq, float z0, float phi0) {
    float phi = phi0;
    float aux;
    float val;
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        val = _aux_dheight(rhosq, z0, phi);
        aux = phi;
        phi = phi - val/_daux_dheight(rhosq, z0, phi);
        if (abs(phi - aux) < NEWTON_TOLERANCE) {
            break;
        }
    }
    return phi;
}

/*
// runs the newton algorithm to find the zero of _aux_dheight
// starting from phi0
// OLD VERSION : bad stopping condition
float _aux_dheight_newton(float rhosq, float z0, float phi0) {
    float phi = phi0;
    float val = _aux_dheight(rhosq, z0, phi);

    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        if (abs(val)< NEWTON_TOLERANCE) {
            break;
        }
        else {
            phi = phi - val/_daux_dheight(rhosq, z0, phi);
            val = _aux_dheight(rhosq, z0, phi);
        }
    }
    return phi;
}
*/


// return the second and third zero (if they exit) of _height (seen as a function of phi)
// - use the Newton method
// - the starting point of the Newton method is obtained via a binary search
// if the second zero does not exists, return false
// otherwise returns true and populate `phis`with the second and first zeros
bool zerobis_height(float rhosq, float z0, out float[2] phis) {
    // find the minimum of _height on [2pi, 4pi]
    float phi0 = _aux_dheight_newton_init(rhosq, z0);
    float phi1 = _aux_dheight_newton(rhosq, z0, phi0);
    float height_min = _height(rhosq, z0, phi1);
    //debugColor = 10.*vec3(height_min, -height_min, 0);
    //debugColor = vec3(phi1 - 2.*PI, 0, 0)/(2.*PI);
    if (height_min > 0.) {
        //debugColor = vec3(1, 1, 0);
        return false;
    }
    float phi2 = _height_newton_init(rhosq, z0, 2. * PI, phi1, false);
    float res2 = _height_newton(rhosq, z0, phi2);
    float phi3 = _height_newton_init(rhosq, z0, phi1, 4. * PI, true);
    float res3 = _height_newton(rhosq, z0, phi3);
    //debugColor = vec3(res3 - 2.*PI, 0, 0)/(2.*PI);
    phis[0] = res2;
    phis[1] = res3;
    //debugColor =  (vec3(0, phi3, 0) - vec3(2.*PI, 2.*PI, 0.))/2.*PI;
    return true;
}


/*

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

*/
