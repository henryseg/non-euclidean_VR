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
float _height(float rhoSq, float z0, float phi) {
    float res = -z0 + phi;

    if (phi < 0.001) {
        // when phi is close to zero we replace the next term by an asymptotic expansion
        float phi2 = phi * phi;
        float phi4 = phi2 * phi2;
        res = res + rhoSq * phi * (phi2 + 30.) * (phi4 + 840.) / 302400.;
    }
    else {
        res = res + 0.5 * rhoSq * (phi - sin(phi)) / pow(2. * sin(0.5 * phi), 2.0);
    }
    return res;
}

// derivative of _height with respect to phi
float _dheight(float rhoSq, float z0, float phi) {
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
        res =  res - rhoSq * (phi * cPhi - 2. * sPhi) / (8. * pow(sPhi, 3.));
    }
    return res;
}

// second derivative of _height with respect to phi
float _d2height(float rhoSq, float z0, float phi) {
    float res;

    if (phi < 0.001) {
        // when phi is close to zero we replace the next term by an asymptotic expansion
        float phi2 = phi * phi;
        float phi4 = phi2 * phi2;
        float phi6 = phi4 * phi2;
        res = rhoSq * phi * (55440. + 6600. * phi2 + 462. * phi4 + 25. * phi6) / 3326400.;
    }
    else {
        float cPhi = cos(0.5 * phi);
        float sPhi = sin(0.5 * phi);
        res =  rhoSq * (2. * phi * pow(cPhi, 2.) - 6. * cPhi * sPhi + phi) / (16. * pow(sPhi, 4.));
    }
    return res;
}


// return a value of phi between phimin and phimax such that _height
// (seen as a function of phi) is positive
// this value will serve as starting point for the newtown method
// the output is found using a binary search
// we assume that _height is defined and monotone on the whole interval (phimin, phimax)
// the boolean `increasing` says if it is increasing or decreasing
float _height_newton_init(float rhoSq, float z0, float phimin, float phimax, bool increasing) {
    float auxmin = phimin;
    float auxmax = phimax;
    float aux, val;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        aux = 0.5 * auxmin + 0.5 * auxmax;
        val = _height(rhoSq, z0, aux);
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
float _height_newton(float rhoSq, float z0, float phi0) {
    float phi = phi0;
    float aux;
    float val;
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        // value of _height at phi
        val = _height(rhoSq, z0, phi);
        // backup of the previous value of phi
        aux = phi;
        // new value of phi
        phi = phi - val/_dheight(rhoSq, z0, phi);
        if (abs(phi - aux) < NEWTON_TOLERANCE) {
            break;
        }
    }
    return phi;
}


// return the first zero of _height (seen as a function of phi)
// - use the Newton method
// - the starting point of the Newton method is obtained via a binary search
// - recall that _height is increasing on [0, 2pi] (as a function of phi)
float zero_height(float rhoSq, float z0) {
    float phi0 = _height_newton_init(rhoSq, z0, 0., 2. * PI, true);
    return _height_newton(rhoSq, z0, phi0);
}

// return a first approximation of the zero of _dheight on [2 * n * pi, 2 * (n+1) * pi]
// using a binary search
// note that _dheight is increasing the given interval
float _dheight_newton_init(float rhosq, float z0, int n) {
    float nFloat = float(n);
    float auxmin = 2. * nFloat * PI;
    float auxmax = 2. * (nFloat + 1.) * PI;
    float aux, val;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        if (auxmax - auxmin < NEWTON_INIT_TOLERANCE) {
            break;
        }
        aux = 0.5 * auxmin + 0.5 * auxmax;
        val = _dheight(rhosq, z0, aux);
        if (val >= 0.) {
            auxmax = aux;
        }
        else {
            auxmin = aux;
        }
    }
    return aux;
}

// runs the newton algorithm to find the zero of _aux_dheight
// starting from phi0
float _dheight_newton(float rhosq, float z0, float phi0) {
    float phi = phi0;
    float aux;
    float val;
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        val = _dheight(rhosq, z0, phi);
        aux = phi;
        phi = phi - val/_d2height(rhosq, z0, phi);
        if (abs(phi - aux) < NEWTON_TOLERANCE) {
            break;
        }
    }
    return phi;
}



// return the two zeros (if they exit) of _height (seen as a function of phi)
// on the interval [2npi, 2(n+1)pi]
// - use the Newton method
// - the starting point of the Newton method is obtained via a binary search
// if the second zero does not exists, return false
// otherwise returns true and populate `phis` with the zeros on this interval
bool zerobis_height(float rhoSq, float z0, int n, out float[2] phis) {
    float nFloat = float(n);
    // find the minimum of _height on [2npi, 2(n+1)pi]
    float aux0 = _dheight_newton_init(rhoSq, z0, n);
    float aux1 = _dheight_newton(rhoSq, z0, aux0);
    float height_min = _height(rhoSq, z0, aux1);
    // test if the minimum is positive
    if (height_min > 0.) {
        return false;
    }
    else {
        // if not, find the zeros of _height
        float phi0 = _height_newton_init(rhoSq, z0, 2. * nFloat * PI, aux1, false);
        phis[0] = _height_newton(rhoSq, z0, phi0);
        float phi1 = _height_newton_init(rhoSq, z0, aux1, 2. * (nFloat + 1.) * PI, true);
        phis[1] = _height_newton(rhoSq, z0, phi1);
        return true;
    }
}

