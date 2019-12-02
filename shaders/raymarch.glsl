#version 300 es
out vec4 out_FragColor;


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
//projection of cube to klein model
const float modelHalfCube =  0.5;
//corner of cube in Klein model, useful for horosphere distance function
const vec4 modelCubeCorner = vec4(modelHalfCube, modelHalfCube, modelHalfCube, 1.0);

vec3 debugColor = vec3(0.5, 0, 0.8);


//----------------------------------------------------------------------------------------------------------------------
// Ellitpic integrals and functions
//----------------------------------------------------------------------------------------------------------------------


/*

   Each pixel only involves a single geodesic.
   Hence all the parameters appearing in the elliptic integrals can be pre-computed once for all before marching.
   We store them in global variables.
   The names refer to the Remi's handwritten notes (following closely Troyanov's paper).
   The prefix ``ell`` is used to avoid any ambiguity

*/

// constants, purely related to the elliptic integrals / functions
float ell_k;
float ell_kprime;
float ell_m;
float ell_K;
float ell_E;

// constants related to the parametrization of the geodesic, but only depending on the trajectory of the geodesic
float ell_mu;
float ell_L;


/*

    *** Legendre elliptic integrals ***

    The modulus/parameter  k / k' / m are always implicit.
    We use the corresponding global variable to avoid redundant computations.

    The sources for the algorithms are:

    [1] Frank W. J. Olver, Daniel W. Lozier, Ronald F. Boisvert, Charles W. Clark
    NIST handbook of mathematical functions
    Cambridge University Press (2010)

    [2] Milton Abramowitz, Irene A. Stegun
    Handbook of Mathematical Functions_ with Formulas, Graphs, and Mathematical Tables
    National Bureau of Standards (1970)

    [3] Bulirsch, Roland
    Numerical calculation of elliptic integrals and elliptic functions
    Numer. Math. (7) 78--90 (1965)
    DOI: 10.1007/BF01397975


    TODO.
        - Reduce the number of local variables when computing an iteration.
        e.g. to compute the AGM, no need of a1 and g1, just a single temporary variable
        - Factor the AGM computations.
        There are indeed the same for all the elliptic functions, and thus alogn the geodesic.
        They could be pre-computed and stored in a global variable

*/

// maximal number of steps in the AGM algorithm
const int AGMSteps = 20;
// tolerance of the AGM algorithm
const float AGMTolerance = 0.0000000001;

vec2 ellipke() {
    // Return the complete integeral of the first and second kind with parameter m
    // Note that sqrt(1 - m) = kprime
    // Computed with the AGM method, see 19.8(i) in [1]

    // initialization of all the variables
    float a0 = 1.;
    float g0 = ell_kprime;
    float aux = 0.5 * ell_m;

    float a1;
    float g1;
    float error;

    for (int i=0; i < AGMSteps; i++) {
        a1 = 0.5 * (a0 + g0);
        g1 = sqrt(a0 * g0);
        error = 0.5 * (a0 - g0);
        aux = aux + pow(2., float(i)) * error * error;

        if (error < AGMTolerance) {
            break;
        }

        a0 = a1;
        g0 = g1;
    }
    float K = 0.5 * PI / a0;
    float E = K * (1. - aux);
    return vec2(K, E);
}

vec4 ellipj(float u) {
    // Return the 3 Jacobi ellpitic functions sn(u|m), cn(u|m) and dn(u|m) as well as the amplidute phi = am(u|m)
    // i.e. the number phi such that sin(phi) = sn(u|m) and cos(phi) = cos(u|m)
    // The results is output as [sn, cn, dn, phi]
    // Computed with the AGM method, see Algorithm 5 in [3]

    // initialization of all the variables

    // track of the AGM algorithm
    vec2 AGMList[AGMSteps];
    AGMList[0] = vec2(1., ell_kprime);
    // number of step
    int l = 0;

    // variable used during the first induction (computing the AGM)
    float a0;
    float g0;
    float error;
    for (int i = 0; i < AGMSteps - 1; i++) {
        a0 = AGMList[i].x;
        g0 = AGMList[i].y;
        error = 0.5 * (a0 - g0);
        AGMList[i+1] = vec2(0.5 * (a0 + g0), sqrt(a0 * g0));
        l = l + 1;
        if (error < AGMTolerance) {
            break;
        }
    }
    a0 = AGMList[l].x;
    g0 = AGMList[l].y;
    float eps = 1.;
    if (sin(u * a0) < 0.) {
        eps = -1.;
    }

    // variables used during the second induction
    float c = a0 * cos(u * a0) / sin(u * a0);
    float d = 1.;
    float aux_c;
    float aux_d;

    for (int j = 0; j < l; j++) {
        aux_c = c * d;
        aux_d = (c * c / AGMList[l-j].x + AGMList[l - 1 - j].y) / (c * c / AGMList[l-j].x + AGMList[l - 1 - j].x);
        c = aux_c;
        d = aux_d;
    }

    // wrappind the results
    float sn = eps / sqrt(1. + c * c);
    float cn = c * sn;
    return vec4(sn, cn, d, atan(sn, cn));
}

float ellipz(float phi) {
    // Return the Jacobi Zeta function, whose argument is an angle, i.e.
    // Z(phi|m) = E(phi|m) - [E(m)/K(m)] * F(phi|m)
    // (the amplitude phi can be computed from the Jacobi functions above)
    // Computed with the AGM algorithm, see §17.6 in [2]

    // TODO. simplify the computation to get totally rid of the arctan (this part is used only to compute E(phi|m)

    // initializing the parameters of the induction
    float a0 = 1.;
    float g0 = ell_kprime;
    float phi0 = phi;
    float t0 = tan(phi0);
    float mod0 = 0.;
    float res = 0.;
    float a1;
    float g1;
    float c1;
    float phi1;
    float t1;
    float mod1;
    float aux;

    for (int i=0; i < AGMSteps; i++) {
        c1 = 0.5 * (a0 - g0);
        aux = g0 / a0;
        phi1 = (phi0 + mod0 * PI) + atan(aux * t0);
        mod1 = floor((phi1 + 0.5 * PI)/PI);
        t1 = t0 * (1. + aux) / (1. - aux * t0 * t0);
        res = res + c1 * sin(phi1);
        a1 = 0.5 * (a0 + g0);
        g1 = sqrt(a0 * g0);

        if (c1 / a0 < AGMTolerance) {
            break;
        }

        a0 = a1;
        g0 = g1;
        phi0 = phi1;
        t0 = t1;
        mod0 = mod1;
    }

    return res;

}

//----------------------------------------------------------------------------------------------------------------------
// STRUCT isometry
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating isometries of the space
  A tangVector is given by
  - matrix : a 4x4 matrix
*/

struct Isometry {
    mat4 matrix;// isometry of the space
};


Isometry composeIsometry(Isometry A, Isometry B)
{
    return Isometry(A.matrix*B.matrix);
}


Isometry makeLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    exp(p.z), 0., 0., 0.,
    0., exp(-p.z), 0., 0.,
    0., 0., 1., 0,
    p.x, p.y, p.z, 1.
    );
    return Isometry(matrix);
}

Isometry makeInvLeftTranslation(vec4 p) {
    mat4 matrix =  mat4(
    exp(-p.z), 0., 0., 0.,
    0., exp(p.z), 0., 0.,
    0., 0., 1., 0,
    -exp(-p.z) * p.x, -exp(p.z) * p.y, -p.z, 1.
    );
    return Isometry(matrix);
}

vec4 translate(Isometry A, vec4 v) {
    // translate a point of a vector by the given direction
    return A.matrix * v;
}

//----------------------------------------------------------------------------------------------------------------------
// STRUCT tangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Data type for manipulating points in the tangent bundler
  A tangVector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Implement various basic methods to manipulate them
*/

struct tangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


struct localTangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// pull back at the origin of the tangent vector
};

//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------

Isometry makeLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}

Isometry makeLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}

Isometry makeInvLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}

Isometry makeInvLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}

tangVector translate(Isometry A, tangVector v) {
    // over load to translate a direction
    return tangVector(A.matrix * v.pos, A.matrix * v.dir);
}

localTangVector translate(Isometry A, localTangVector v) {
    // over load to translate a direction
    return localTangVector(A.matrix * v.pos, v.dir);
}

tangVector rotateFacing(mat4 A, tangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(v.pos, A*v.dir);
}

localTangVector rotateFacing(mat4 A, localTangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return localTangVector(v.pos, A*v.dir);
}

//----------------------------------------------------------------------------------------------------------------------
// CONVERSION between two representations of tangent vectors
//----------------------------------------------------------------------------------------------------------------------


tangVector toTangVector(localTangVector v) {
    // convert a local tangent vector to a tangent vector
    Isometry isom = makeLeftTranslation(v.pos);
    vec4 newDir = translate(isom, v.dir);
    return tangVector(v.pos, newDir);
}

localTangVector toLocalTangVector(tangVector v) {
    // convert a tangent vector to a local tangent vector
    Isometry isom = makeInvLeftTranslation(v.pos);
    vec4 newDir = translate(isom, v.dir);
    return localTangVector(v.pos, newDir);
}

vec4 car2sph(vec4 v) {
    // convert a vector with (x,y,z,0) cartesian coordinates to a vector with (r,theta,phi, 0) spherical coordinates
    float r = length(v.xyz);
    float theta = atan(v.y, v.x);
    float phi = atan(length(v.xy), v.z);
    return vec4(r, theta, phi, 0.);
}

vec4 sph2car(vec4 v) {
    // convert a vector with (r,theta,phi, 0) spherical coordinates to a vector with (x,y,z,0) cartesian coordinates
    float r = v.x;
    float theta = v.y;
    float phi = v.z;
    return vec4(r * cos(theta) * sin(phi), r * sin(theta) * sin(phi), r * cos(phi), 0.);
}


//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/

tangVector add(tangVector v1, tangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir + v2.dir);
}

localTangVector add(localTangVector v1, localTangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir + v2.dir);
}

tangVector sub(tangVector v1, tangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir - v2.dir);
}

localTangVector sub(localTangVector v1, localTangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir - v2.dir);
}

tangVector scalarMult(float a, tangVector v) {
    // scalar multiplication of a tangent vector
    return tangVector(v.pos, a * v.dir);
}

localTangVector scalarMult(float a, localTangVector v) {
    // scalar multiplication of a tangent vector
    return localTangVector(v.pos, a * v.dir);
}

tangVector translate(mat4 isom, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(isom * v.pos, isom * v.dir);
}

tangVector translate(mat4 isom, localTangVector v) {
    // apply an isometry to the local tangent vector
    return tangVector(isom * v.pos, v.dir);
}

tangVector applyMatrixToDir(mat4 matrix, tangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return tangVector(v.pos, matrix * v.dir);
}

localTangVector applyMatrixToDir(mat4 matrix, localTangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return localTangVector(v.pos, matrix * v.dir);
}


float tangDot(tangVector u, tangVector v){
    mat3 g = mat3(
    exp(-2. * u.pos.z), 0., 0.,
    0., exp(2. * u.pos.z), 0.,
    0., 0., 1.
    );
    return dot(u.dir.xyz, g * v.dir.xyz);

}

float tangDot(localTangVector u, localTangVector v){
    return dot(u.dir.xyz, v.dir.xyz);
}

float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

float tangNorm(localTangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

tangVector tangNormalize(tangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return tangVector(v.pos, v.dir/tangNorm(v));
}

localTangVector tangNormalize(localTangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return localTangVector(v.pos, v.dir/tangNorm(v));
}

float cosAng(tangVector u, tangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}

float cosAng(localTangVector u, localTangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}


mat4 tangBasis(vec4 p){
    // return a basis of vectors at the point p

    vec4 basis_x = vec4(1., 0., 0., 0.);
    vec4 basis_y = vec4(0., 1., 0., 0.);
    vec4 basis_z = vec4(0., 0., 1., 0.);
    mat4 theBasis = mat4(0.);
    theBasis[0]=basis_x;
    theBasis[1]=basis_y;
    theBasis[2]=basis_z;
    return theBasis;
}

//mat4 tangBasis(vec4 p){
//
//    return makeLeftTranslation(p).matrix;
//}



void init_ellip(tangVector u) {
    // initializes all the parameters needed to march along the geodesic directed by u
    // we assume that the position of u is the origin
    // if ab = 0 (hyperbolic sheets), all the parameters are not needed,
    // however their computations are trivial
    // (all the elliptic integrals becomes, trivial, the AGM stops where it starts, etc)
    // instead of adding cases, we simply run the computations

    // some renaming to simplify the formulas
    // by assumption a^2 + b^2 + c^2 = 1
    float ab = abs(u.dir.x * u.dir.y);

    // some auxiliary value to avoind redundant computations of roots.
    float aux1 = sqrt(1. - 2. * ab);
    float aux2 = 2. * sqrt(ab);

    // frequency
    ell_mu = sqrt(1. + 2. * ab);

    // parameters of the elliptic functions
    ell_k = aux1 / ell_mu;
    ell_kprime = aux2 / ell_mu;
    ell_m = (1. - 2. * ab) / (1. + 2. * ab);

    // complete elliptic integrals and related quantities
    vec2 KE = ellipke();
    ell_K = KE.x;
    ell_E = KE.y;

    // if ab = 0 (hyperbolic sheets) then k' = 0, in which case, L will not be needed and makes no sense here
    if (ab != 0.) {
        ell_L = ell_E / (ell_kprime * ell_K) - 0.5 * ell_kprime;
    }

}


//----------------------------------------------------------------------------------------------------------------------
// GLOBAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods computing ``global'' objects
*/

float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    // Isometry moving back to the origin and conversely
    Isometry isomInv = makeInvLeftTranslation(p);

    //vec4 qOrigin = translate(isomInv, q);
    //return  sqrt(exp(-2. * qOrigin.z) * qOrigin.x * qOrigin.x +  exp(2. * qOrigin.z) * qOrigin.y * qOrigin.y + qOrigin.z * qOrigin.z);
    return length(q-p);
}

float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    return fakeDistance(p, q);
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
    return tangNormalize(tangVector(p, q - p));
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}

tangVector flow(tangVector tv, float t){
    // follow the geodesic flow during a time t

    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);
    Isometry isomInv = makeInvLeftTranslation(tv);

    // pull back of the tangent vector at the origin
    tangVector tvOrigin = translate(isomInv, tv);

    // parameters related to the initial condition of the geodesic flow

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tvOrigin.dir.x;
    float b = tvOrigin.dir.y;
    float c = tvOrigin.dir.z;

    vec4 resOriginPos;
    vec4 resOriginDir;

    // we need to distinguish three cases, depending on the type of geodesics

    if (a == 0. && b == 0.) {
        // VERTICAL GEODESIC
        // Particular case of the hyperbolic sheets below
        resOriginPos = vec4(0., 0., c * t, 1.);
        resOriginDir = vec4(0., 0., c, 0.);
    }
    else if (a == 0.) {
        // GEODESIC IN THE HYPERBOLIC SHEET X = 0
        float sht = sinh(t);
        float cht = cosh(t);
        float tht = sht/cht;

        resOriginPos = vec4(
        0.,
        b * sht / (cht + c * sht),
        log(cht + c * sht),
        1.
        );
        resOriginDir = vec4(
        0.,
        b / pow(cht + c * sht, 2.),
        (c + tht) / (1. + c * tht),
        0.
        );
    }
    else if (b == 0.) {
        // GEODESIC IN THE HYPERBOLIC SHEET Y = 0
        float sht = sinh(t);
        float cht = cosh(t);
        float tht = sht/cht;

        resOriginPos = vec4(
        a * sht / (cht - c * sht),
        0.,
        - log(cht - c * sht),
        1.
        );
        resOriginDir = vec4(
        a / pow(cht - c * sht, 2.),
        0.,
        (c - tht) / (1. - c * tht),
        0.
        );
    }
    else if (c == 0. && abs(a) == abs(b)) {
        // STRAIGHT LINES ALONG THE DIAGONALS IN THE XY PLANE
        // Particular case of the generic case below
        resOriginPos = vec4(a * t, b * t, 0., 1.);
        resOriginDir = vec4(a, b, 0., 0.);
    }
    else {

        // GENERIC CASE

        // phase shift (Phi in the handwritten notes)
        float aux = sqrt(1. - 2. * abs(a * b));
        // jacobi functions applied to s0 (we don't care about the amplitude am(s0) here)
        vec3 jacobi_s0 = vec3(
        - c / aux,
        (abs(a) - abs(b)) / aux,
        (abs(a) + abs(b)) / ell_mu
        );

        // sign of a (resp. b)
        float signa = 1.;
        if (a < 0.) {
            signa = -1.;
        }
        float signb = 1.;
        if (b < 0.) {
            signb = -1.;
        }

        // some useful intermediate computation
        float kOkprime = ell_k / ell_kprime;
        float oneOkprime = 1. / ell_kprime;

        // we are now ready to write down the coordinates of the endpoint
        // TODO. reduce the amplitude using the periodicity


        // amplitude (without the phase shift of s0)
        float s = ell_mu * t;
        // jabobi functions applied to the amplitude s
        vec4 jacobi_s = ellipj(s);


        // jacobi function applied to s + s0  (using addition formulas)
        float den = 1. - ell_m * jacobi_s.x * jacobi_s.x * jacobi_s0.x * jacobi_s0.x;
        vec3 jacobi_ss0 = vec3(
        (jacobi_s.x * jacobi_s0.y * jacobi_s0.z + jacobi_s0.x * jacobi_s.y * jacobi_s.z) / den,
        (jacobi_s.y * jacobi_s0.y - jacobi_s.x * jacobi_s.z * jacobi_s0.x * jacobi_s0.z) / den,
        (jacobi_s.z * jacobi_s0.z - ell_m * jacobi_s.x * jacobi_s.y * jacobi_s0.x * jacobi_s0.y) / den
        );

        // Z(mu *t + s0) - Z(s0) (using again addition formulas)
        float zetaj = ellipz(jacobi_s.w) - ell_m * jacobi_s.x * jacobi_s0.x * jacobi_ss0.x;


        // wrapping all the computation
        resOriginPos = vec4(
        signa * sqrt(abs(b / a)) * (
        oneOkprime * zetaj
        + kOkprime * (jacobi_ss0.x - jacobi_s0.x)
        + ell_L * ell_mu * t
        ),
        signb * sqrt(abs(a / b)) * (
        oneOkprime * zetaj
        - kOkprime * (jacobi_ss0.x - jacobi_s0.x)
        + ell_L * ell_mu * t
        ),
        0.5 * log(abs(b / a)) + asinh((ell_k / ell_kprime) * jacobi_ss0.y),
        1.
        );
        resOriginDir = vec4(
        signa * abs(b) * pow(kOkprime * jacobi_ss0.y + oneOkprime * jacobi_ss0.z, 2.),
        signb * abs(a) * pow(kOkprime * jacobi_ss0.y - oneOkprime * jacobi_ss0.z, 2.),
        - ell_k * ell_mu * jacobi_ss0.x,
        0.
        );

        /*
        resOriginPos = vec4(0., 0., 0., 1.);
        resOriginDir = vec4(a, b, c, 0.);
        */

    }

    tangVector resOrigin = tangVector(resOriginPos, resOriginDir);
    return translate(isom, resOrigin);

    //return tangVector(tv.pos + t * tv.dir, tv.dir);
}

uniform highp sampler3D lookupTableX;
uniform highp sampler3D lookupTableY;
uniform highp sampler3D lookupTableZ;
uniform highp sampler3D lookupTableTheta;
uniform highp sampler3D lookupTablePhi;


localTangVector eucFlow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t

    return localTangVector(tv.pos + t * tv.dir, tv.dir);
}

localTangVector tableFlow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t


    // isom to move to the starting point
    Isometry isom = makeLeftTranslation(tv);

    // address of the vexel to look at in the pictures
    // sph has coordinates (r,theta, phi, 0.)
    vec4 sph = car2sph(tv.dir);
    vec3 address = vec3((sph.y + PI) / (2. * PI), sph.z / PI, t);

    // extracting data from the lookupTables
    float x = texture(lookupTableX, address).r;
    float y = texture(lookupTableY, address).r;
    float z = texture(lookupTableZ, address).r;
    float theta = texture(lookupTableTheta, address).r;
    float phi = texture(lookupTablePhi, address).r;

    // packaging the result
    vec4 newPos = vec4(x, y, z, 1.);
    vec4 newLocalDir = sph2car(vec4(1., theta, phi, 0.));
    localTangVector resOrigin =  localTangVector(newPos, newLocalDir);
    return translate(isom, resOrigin);
}

localTangVector flow(localTangVector tv, float t) {
    // overload of the flow for localTangVector
    // follow the geodesic flow during a time t

    // return eucFlow(tv, t);
    return tableFlow(tv, t);

}


//----------------------------------------------------------------------------------------------------------------------
//Geometry of the Models
//----------------------------------------------------------------------------------------------------------------------


//project point back onto the geometry
vec4 geomProject(vec4 p){
    return p;
}


//Project onto the Klein Model
vec4 modelProject(vec4 p){
    return p;

}


//----------------------------------------------------------------------------------------------------------------------
// LIGHT
//----------------------------------------------------------------------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    if (FAKE_LIGHT_FALLOFF){
        //fake linear falloff
        return dist;
    }
    return dist*dist;
}


//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(vec4 p, vec4 center, float radius){
    return exactDist(p, center) - radius;

}

float centerSDF(vec4 p, vec4 center, float radius){
    return sphereSDF(p, center, radius);
}


float vertexSDF(vec4 p, vec4 cornerPoint, float size){
    return sphereSDF(abs(p), cornerPoint, size);
}

float horizontalHalfSpaceSDF(vec4 p, float h) {
    //signed distance function to the half space z < h
    return p.z - h;
}

float horizontalSliceSDF(vec4 p, float h1, float h2) {
    //signed distance function to the half space h1 < z < h2

    return max(p.z - h2, h1-p.z);
    /*
    if(p.z < h1){
        return  h1 - p.z;
    }
    else if (p.z > h2) {
        return p.z - h2;
    }
    else{
        return max (p.z - h2, h1-p.z);
    }
    */
}

float sliceSDF(vec4 p){
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -0.3);
    return max(HS1, HS2);
}

//----------------------------------------------------------------------------------------------------------------------
// Global Constants
//----------------------------------------------------------------------------------------------------------------------
const int MAX_MARCHING_STEPS =  10;
const float MIN_DIST = 0.0;
const float MAX_DIST = 600.0;
const float MAX_STEP_DIST = 0.9;// Maximal length of a step... depends of the generated texture.
//const float EPSILON = 0.0001;
const float EPSILON = 0.051;
const float fov = 90.0;


//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------
tangVector N;//normal vector
tangVector sampletv;
vec4 globalLightColor;
int hitWhich = 0;
Isometry identityIsometry=Isometry(mat4(1.0));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;

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
uniform float depth;


//----------------------------------------------------------------------------------------------------------------------
// Re-packaging isometries, facings in the shader
//----------------------------------------------------------------------------------------------------------------------

//This actually occurs at the beginning of main() as it needs to be inside of a function


//----------------------------------------------------------------------------------------------------------------------
// Scene Definitions
//----------------------------------------------------------------------------------------------------------------------
// Turn off the local scene
// Local signed distance function : distance from p to an object in the local scene

float localSceneSDF(vec4 p){
    //vec4 center = ORIGIN;
    //float sphere = centerSDF(p, center, centerSphereRadius);
    //float vertexSphere = 0.0;
    //vertexSphere = vertexSDF(abs(p), modelCubeCorner, vertexSphereSize);
    //float final = min(vertexSphere, sphere);//unionSDF
    //return final;

    vec4 center = vec4(0., 0., 0., 1.);;
    float sphere = centerSDF(p, center, 0.3);
    return sphere;
    
    //    float slabDist;
    //    float sphDist;
    //    slabDist = sliceSDF(p);
    //    sphDist=sphereSDF(p,vec4(0.,0.,-0.2,1.),0.28);
    //    return max(slabDist,-sphDist);
}

//GLOBAL OBJECTS SCENE ++++++++++++++++++++++++++++++++++++++++++++++++
// Global signed distance function : distance from cellBoost * p to an object in the global scene
float globalSceneSDF(vec4 p){
    // correct for the fact that we have been moving
    vec4 absolutep = translate(cellBoost, p);
    float distance = MAX_DIST;
    //Light Objects
    for (int i=0; i<4; i++){
        float objDist;
        objDist = sphereSDF(
        absolutep,
        lightPositions[i],
        0.1
        //    1.0/(10.0*lightIntensities[i].w)
        );
        distance = min(distance, objDist);
        if (distance < EPSILON){
            hitWhich = 1;
            globalLightColor = lightIntensities[i];
            return distance;
        }
    }


    //Global Sphere Object

    float objDist;
    //    float slabDist;
    //    float sphDist;
    //    slabDist = sliceSDF(absolutep);
    //    sphDist=sphereSDF(absolutep,vec4(0.,0.,-0.2,1.),0.5);
    //    objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;


    //horizontalSliceSDF(absolutep, -0.2, -0.4);

    //global plane




    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    //objDist = sphereSDF(absolutep, globalObjPos,0.1);

    distance = min(distance, objDist);
    if (distance < EPSILON){
        hitWhich = 2;
    }
    return distance;
}


// check if the given point p is in the fundamental domain of the lattice.

float denominator=GoldenRatio+2.;

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);


    //lattice basis divided by the norm square
    vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
    vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
    vec4 v3 = vec4(0., 0., 1./z0, 0.);
    /*
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }*/

    if (dot(p, v1) > 0.5) {
        fixMatrix = Isometry(invGenerators[0]);
        return true;
    }
    if (dot(p, v1) < -0.5) {
        fixMatrix = Isometry(invGenerators[1]);
        return true;
    }
    if (dot(p, v2) > 0.5) {
        fixMatrix = Isometry(invGenerators[2]);
        return true;
    }
    if (dot(p, v2) < -0.5) {
        fixMatrix = Isometry(invGenerators[3]);
        return true;
    }
    return false;
}


// overload of the previous method with tangent vector
bool isOutsideCell(tangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}

// overload of the previous method with tangent vector
bool isOutsideCell(localTangVector v, out Isometry fixMatrix){
    return isOutsideCell(v.pos, fixMatrix);
}


//----------------------------------------------------------------------------------------------------------------------
// GEOM DEPENDENT
//----------------------------------------------------------------------------------------------------------------------


//NORMAL FUNCTIONS ++++++++++++++++++++++++++++++++++++++++++++++++++++
tangVector estimateNormal(vec4 p) { // normal vector is in tangent hyperplane to hyperboloid at p
    // float denom = sqrt(1.0 + p.x*p.x + p.y*p.y + p.z*p.z);  // first, find basis for that tangent hyperplane
    float newEp = EPSILON * 10.0;
    mat4 theBasis= tangBasis(p);
    vec4 basis_x = theBasis[0];
    vec4 basis_y = theBasis[1];
    vec4 basis_z = theBasis[2];
    if (hitWhich != 3){ //global light scene
        //p+EPSILON * basis_x should be lorentz normalized however it is close enough to be good enough
        tangVector tv = tangVector(p,
        basis_x * (globalSceneSDF(p + newEp*basis_x) - globalSceneSDF(p - newEp*basis_x)) +
        basis_y * (globalSceneSDF(p + newEp*basis_y) - globalSceneSDF(p - newEp*basis_y)) +
        basis_z * (globalSceneSDF(p + newEp*basis_z) - globalSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);

    }
    else { //local scene
        tangVector tv = tangVector(p,
        basis_x * (localSceneSDF(p + newEp*basis_x) - localSceneSDF(p - newEp*basis_x)) +
        basis_y * (localSceneSDF(p + newEp*basis_y) - localSceneSDF(p - newEp*basis_y)) +
        basis_z * (localSceneSDF(p + newEp*basis_z) - localSceneSDF(p - newEp*basis_z))
        );
        return tangNormalize(tv);
    }
}


//----------------------------------------------------------------------------------------------------------------------
// DOING THE RAYMARCH
//----------------------------------------------------------------------------------------------------------------------


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).

void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    tangVector tv = rayDir;
    tangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);

            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(0.1, localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    hitWhich = 3;
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else { localDepth=MAX_DIST; }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identityIsometry;
                sampletv = tv;
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}



void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    // overlaod of the raymarching with localTangVector
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:


    if (TILING_SCENE){
        int crossing = 0;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);

            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                marchStep = MIN_DIST;
                crossing += 1;
                //
                //                if(crossing == 2) {
                //                    hitWhich =5;
                //                    if(abs(fixMatrix.matrix[3][0]) == 1.){
                //                        debugColor = vec3(1,0,0);
                //                    }
                //                    if(abs(fixMatrix.matrix[3][1]) == 1.){
                //                        debugColor = vec3(0,1,0);
                //                    }
                //                    if(fixMatrix.matrix[3][2] != 0.){
                //                        if (fixMatrix.matrix[3][2] >0.) {
                //                            debugColor = vec3(0.7,0.7,1);
                //                        }
                //                        else {
                //                            debugColor = vec3(0,0,0.5);
                //                        }
                //
                //                    }
                //                    break;
                //                }

            }
            else {
                float localDist = localSceneSDF(localtv.pos);
                if (localDist < EPSILON){
                    //                    if(crossing > 0) {
                    //                        hitWhich = 3;
                    //                    sampletv = toTangVector(localtv);
                    //                    break;
                    //                    }
                    //                    else {
                    //                        localDist =0.2;
                    //                    }

                    hitWhich = 3;
                    sampletv = toTangVector(localtv);
                    break;
                    //                     hitWhich = 5;
                    //                   debugColor=0.5*translate(totalFixMatrix,localtv).dir.xyz;
                    //                    break;
                }
                marchStep = min(MAX_STEP_DIST, localDist);
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else { localDepth=MAX_DIST; }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 4) {
                hitWhich = 5;
                //debugColor = vec3(marchStep, 0., 0.);
                debugColor = 0.25*abs(tv.pos.xyz);
                break;
            }*/


            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                //hitWhich = 5;
                //debugColor = vec3(1.,0.,0.);

                totalFixMatrix = identityIsometry;
                sampletv = toTangVector(tv);
                return;
                //                totalFixMatrix = identityIsometry;
                //                hitWhich=5;
                //                debugColor=0.5*tv.dir.xyz;
                //                return;
            }
            marchStep = min(MAX_STEP_DIST, globalDist);
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                break;
            }
        }
    }
}


//void raymarch(tangVector rayDir, out mat4 totalFixMatrix){
//    mat4 fixMatrix;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = mat4(1.0);
//
//
//    // Trace the local scene, then the global scene:
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector localEndtv = flow(localtv, localDepth);
//
//        if (isOutsideCell(localEndtv, fixMatrix)){
//            totalFixMatrix = fixMatrix * totalFixMatrix;
//            localtv = translate(fixMatrix, localEndtv);
//            localDepth = MIN_DIST;
//        }
//        else {
//            float localDist = min(0.1, localSceneSDF(localEndtv.pos));
//            if (localDist < EPSILON){
//                hitWhich = 3;
//                sampletv = localEndtv;
//                break;
//            }
//            localDepth += localDist;
//            globalDepth += localDist;
//        }
//    }
//
//
//    // Set for localDepth to our new max tracing distance:
//    localDepth = min(globalDepth, MAX_DIST);
//    globalDepth = MIN_DIST;
//    for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//        tangVector globalEndtv = flow(tv, globalDepth);
//
//        float globalDist = globalSceneSDF(globalEndtv.pos);
//        if (globalDist < EPSILON){
//            // hitWhich has now been set
//            totalFixMatrix = mat4(1.0);
//            sampletv = globalEndtv;
//            return;
//        }
//        globalDepth += globalDist;
//        if (globalDepth >= localDepth){
//            break;
//        }
//    }
//}


//----------------------------------------------------------------------------------------------------------------------
// Lighting Functions
//----------------------------------------------------------------------------------------------------------------------
//SP - Sample Point | TLP - Translated Light Position | V - View Vector
vec3 lightingCalculations(vec4 SP, vec4 TLP, tangVector V, vec3 baseColor, vec4 lightIntensity){
    //Calculations - Phong Reflection Model
    tangVector L = tangDirection(SP, TLP);
    tangVector R = sub(scalarMult(2.0 * cosAng(L, N), N), L);
    //Calculate Diffuse Component
    float nDotL = max(cosAng(N, L), 0.0);
    vec3 diffuse = lightIntensity.rgb * nDotL;
    //Calculate Specular Component
    float rDotV = max(cosAng(R, V), 0.0);
    vec3 specular = lightIntensity.rgb * pow(rDotV, 10.0);
    //Attenuation - Of the Light Intensity
    float distToLight = fakeDistance(SP, TLP);
    float att = 0.6*lightIntensity.w /(0.01 + lightAtt(distToLight));
    //Compute final color
    return att*((diffuse*baseColor) + specular);
}

vec3 phongModel(Isometry totalFixMatrix, vec3 color){
    vec4 SP = sampletv.pos;
    vec4 TLP;//translated light position
    tangVector V = tangVector(SP, -sampletv.dir);
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't
    for (int i = 0; i<4; i++){
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, lightPositions[i]);
        color += lightingCalculations(SP, TLP, V, vec3(1.0), lightIntensities[i]);
    }
    return color;
}


//EARTH TEXTURING COLOR COMMANDS

// return the two smallest numbers in a triplet
vec2 smallest(in vec3 v)
{
    float mi = min(v.x, min(v.y, v.z));
    float ma = max(v.x, max(v.y, v.z));
    float me = v.x + v.y + v.z - mi - ma;
    return vec2(mi, me);
}

// texture a 4D surface by doing 4 2D projections in the most
// perpendicular possible directions, and then blend them
// together based on the surface normal
vec3 boxMapping(in sampler2D sam, in tangVector point)
{ // from Inigo Quilez
    vec4 m = point.dir*point.dir; m=m*m; m=m*m;

    vec3 x = texture(sam, smallest(point.pos.yzw)).xyz;
    vec3 y = texture(sam, smallest(point.pos.zwx)).xyz;
    vec3 z = texture(sam, smallest(point.pos.wxy)).xyz;
    vec3 w = texture(sam, smallest(point.pos.xyz)).xyz;

    return (x*m.x + y*m.y + z*m.z + w*m.w)/(m.x+m.y+m.z+m.w);
}

vec3 sphereOffset(Isometry globalObjectBoost, vec4 pt){
    pt = translate(cellBoost, pt);
    pt = inverse(globalObjectBoost.matrix) * pt;
    return tangDirection(ORIGIN, pt).dir.xyz;
}


vec3 ballColor(Isometry totalFixMatrix, tangVector sampletv){
    if (EARTH){
        N = estimateNormal(sampletv.pos);
        vec3 color = texture(earthCubeTex, sphereOffset(globalObjectBoost, sampletv.pos)).xyz;
        vec3 color2 = phongModel(totalFixMatrix, color);
        //color = 0.9*color+0.1;
        return 0.5*color + 0.5*color2;
    }
    else {
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        color = 0.9*color+0.1;
        return color;
        //generically gray object (color= black, glowing slightly because of the 0.1)
    }
}


vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    if (FAKE_LIGHT){
        //make the objects have their own color
        //color the object based on its position in the cube
        vec4 samplePos=modelProject(sampletv.pos);
        //Point in the Klein Model unit cube    
        float x=samplePos.x;
        float y=samplePos.y;
        float z=samplePos.z;
        x = 0.9*x/modelHalfCube;
        y = 0.9*y/modelHalfCube;
        z = 0.9*z/modelHalfCube;
        vec3 color = vec3(x, y, z);
        N = estimateNormal(sampletv.pos);
        color = phongModel(totalFixMatrix, 0.1*color);
        return 0.9*color+0.1;
        //adding a small constant makes it glow slightly
    }
    else {
        //if we are doing TRUE LIGHTING
        // objects have no natural color, only lit by the lights
        N = estimateNormal(sampletv.pos);
        vec3 color=vec3(0., 0., 0.);
        color = phongModel(totalFixMatrix, color);
        return color;
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Tangent Space Functions
//----------------------------------------------------------------------------------------------------------------------

tangVector getRayPoint(vec2 resolution, vec2 fragCoord, bool isLeft){ //creates a tangent vector for our ray
    if (isStereo == 1){
        resolution.x = resolution.x * 0.5;
        if (!isLeft) { fragCoord.x = fragCoord.x - resolution.x; }
    }
    vec2 xy = 0.2*((fragCoord - 0.5*resolution)/resolution.x);
    float z = 0.1/tan(radians(fov*0.5));
    tangVector tv = tangVector(ORIGIN, vec4(xy, -z, 0.0));
    tangVector v =  tangNormalize(tv);
    return v;
}

//----------------------------------------------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------------------------------------------

void main(){

    currentBoost=Isometry(currentBoostMat);
    leftBoost=Isometry(leftBoostMat);
    rightBoost=Isometry(rightBoostMat);
    cellBoost=Isometry(cellBoostMat);
    invCellBoost=Isometry(invCellBoostMat);
    globalObjectBoost=Isometry(globalObjectBoostMat);


    //stereo translations ----------------------------------------------------
    bool isLeft = gl_FragCoord.x/screenResolution.x <= 0.5;
    tangVector rayDir = getRayPoint(screenResolution, gl_FragCoord.xy, isLeft);

    if (isStereo == 1){
        if (isLeft){
            rayDir = rotateFacing(leftFacing, rayDir);
            rayDir = translate(leftBoost, rayDir);
        }
        else {
            rayDir = rotateFacing(rightFacing, rayDir);
            rayDir = translate(rightBoost, rayDir);
        }
    }
    else {
        rayDir = rotateFacing(facing, rayDir);
        rayDir = translate(currentBoost, rayDir);
    }

    //get our raymarched distance back ------------------------
    Isometry totalFixMatrix = identityIsometry;
    // intialize the parameters of the elliptic integrals/functions
    init_ellip(rayDir);
    // do the marching
    raymarch(rayDir, totalFixMatrix);


    // hitWhich = 5;
    // the coordinate used to get data from the texture are between 0 and 1
    // debugColor = vec3(0.1 * ell_K, 0., 0.);


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.3);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        out_FragColor = vec4(globalLightColor.rgb, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor=ballColor(totalFixMatrix, sampletv);
        out_FragColor = vec4(pixelColor, 1.0);
        return;
    }
    else {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

}