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

//const bool TILING=false;
//const bool PLANES=false;
//
//bool DRAGON=!(TILING||PLANES);

//bool DRAGON_PLANE=not(TILING||PLANES);


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
// Global Constants
//----------------------------------------------------------------------------------------------------------------------
int MAX_MARCHING_STEPS =  120;
const float MIN_DIST = 0.0;
float MAX_DIST = 320.0;


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

//const float EPSILON = 0.0001;
const float EPSILON = 0.0005;
const float fov = 90.0;


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
const float AGMTolerance = 0.000001;
// steps performed to compute the AGM (useful for the Jacobi functions)
// the coordinates of the stored vec3 have the following meaning
// - x : arithmetic mean
// - y : geometric mean
// - z : error
vec3 AGMList[AGMSteps];
// number of steps actually used for the AGM, the index of the last non-zero entries in AGMList should be AGMLength - 1
int AGMLength;

void agm() {
    // Compute the AGM of 1 and sqrt(1-m) to the given accuracy :
    // Note that sqrt(1 - m) = kprime
    // maximal number of steps : AGMMaxSteps
    // tolerance for the error : AGMTolerance
    // index of the last step : AGMIndex

    // initialization
    AGMList[0] = vec3(1., ell_kprime, ell_k);
    AGMLength = 1;

    // variable used during the induction
    float a0;
    float g0;
    float error;

    // induction
    for (int i = 1; i < AGMSteps; i++) {
        a0 = AGMList[i - 1].x;
        g0 = AGMList[i - 1].y;
        error = 0.5 * (a0 - g0);

        if (error < AGMTolerance) {
            break;
        }

        AGMList[i] = vec3(0.5 * (a0 + g0), sqrt(a0 * g0), error);
        AGMLength = AGMLength + 1;
    }
}

vec2 ellipke() {
    // Return the complete integeral of the first and second kind
    // Computed with the AGM method, see 19.8(i) in [1]

    // initialization of all the variables;
    float aux = 0.;

    // induction
    for (int i = 0; i < AGMLength; i++) {
        aux = aux + pow(2., float(i-1)) * AGMList[i].z * AGMList[i].z;
    }

    // wrapping up the results
    float K = 0.5 * PI / AGMList[AGMLength - 1].x;
    float E = K * (1. - aux);
    return vec2(K, E);
}

vec3 ellipj1(float u) {
    // Return the 3 Jacobi ellpitic functions sn(u|m), cn(u|m) and dn(u|m)
    // The results is output as [sn, cn, dn]
    // Computed with the AGM method, see Algorithm 5 in [3]
    // Note that the algorithm only makes sense if u is not zero.
    // u is asumme to be between 0 and 2 * K

    // initialization of all the variables
    float a0 = AGMList[AGMLength - 1].x;
    float g0 = AGMList[AGMLength - 1].y;

    float eps = 1.;
    if (sin(u * a0) < 0.) {
        eps = -1.;
    }

    // variables used during the second induction

    float c = a0 * cos(u * a0) / sin(u * a0);
    float d = 1.;
    float aux_c;
    float aux_d;
    float num;
    float den;

    for (int j = 1; j < AGMLength; j++) {
        aux_c = c * d;
        num = (c * c / AGMList[AGMLength - j].x + AGMList[AGMLength - 1 - j].y);
        den = (c * c / AGMList[AGMLength - j].x + AGMList[AGMLength - 1 - j].x);
        aux_d =  num / den;
        c = aux_c;
        d = aux_d;
    }

    // wrappind the results
    float sn = eps / sqrt(1. + c * c);
    float cn = c * sn;
    float dn = d;

    return vec3(sn, cn, dn);
}


vec3 ellipj2(float u) {
    // Return the 3 Jacobi ellpitic functions sn(u|m), cn(u|m) and dn(u|m)
    // The results is output as [sn, cn, dn]
    // Computed with an other AGM method, see 22.20(ii) in [1]
    // u is asumme to be between 0 and 2 * K

    // initializing the parameters for the induction
    float phi0 = pow(2., float(AGMLength-1)) * AGMList[AGMLength - 1].x * u;
    float phi1;
    float aux;


    for (int i = 1; i < AGMLength; i++) {
        aux = AGMList[AGMLength - i].z / AGMList[AGMLength - i].x;
        phi1 = 0.5 * (phi0 + asin(aux * sin(phi0)));
        phi0 = phi1;
    }

    float sn = sin(phi0);
    float cn = cos(phi0);
    float dn = sqrt(1. - ell_m * sn * sn);
    return vec3(sn, cn, dn);

}


vec3 ellipj3(float u) {
    // Return the 3 Jacobi ellpitic functions sn(u|m), cn(u|m) and dn(u|m)
    // Taken from ShaderToy: https://www.shadertoy.com/view/4tlBRl

    float emc = 1.0-ell_m;
    float a, b, c;
    const int N = 4;
    float em[N], en[N];
    a = 1.0;
    float dn = 1.0;
    for (int i = 0; i < N; i++) {
        em[i] = a;
        emc = sqrt(emc);
        en[i] = emc;
        c = 0.5*(a+emc);
        emc = a*emc;
        a = c;
    }
    // Nothing up to here depends on u, so
    // could be precalculated.
    u = c*u;
    float sn = sin(u);
    float cn = cos(u);
    if (sn != 0.0) {
        a = cn/sn; c = a*c;
        for (int i = N-1; i >= 0; i--) {
            b = em[i];
            a = c*a;
            c = dn*c;
            dn = (en[i]+a)/(b+a);
            a = c/b;
        }
        a = 1.0/sqrt(c*c + 1.0);
        if (sn < 0.0) sn = -a;
        else sn = a;
        cn = c*sn;
    }

    return vec3(sn, cn, dn);
}


vec3 ellipjAtZero(float u) {
    // Asymptotic expansion around u = 0 of the Jacobi elliptic functions sn, cn and dn
    // We use the MacLaurin series, see 22.10(i) in [1]

    float k2 = ell_m;
    float k4 = ell_m * ell_m;
    float k6 = k4 * ell_m;

    float u1 = u;
    float u2 = u1 * u;
    float u3 = u2 * u;
    float u4 = u3 * u;
    float u5 = u4 * u;
    float u6 = u5 * u;
    float u7 = u6 * u;

    return vec3(
    u1
    - (1. + k2) * u3 / 6.
    + (1. + 14. * k2 + k4) * u5 / 120.
    - (1. + 135. * k2 + 135. * k4 + k6) * u7 / 5040.,

    1.
    - u2 / 2.
    + (1. + 4. * k2) * u4 / 24.
    - (1. + 44. * k2 + 16. * k4) * u6 / 720.,

    1.
    - k2 * u2 / 2.
    + k2 * (4. + k2) * u4 / 24.
    - k2 * (16. + 44. * k2 + k4) * u6 / 720.
    );
}



vec3 ellipj(float u) {
    // reducing the computation using the periodicity and symmetries of the Jacobi elliptic functions
    // dispatching which algorithm is used to compute the result
    float tolerance = 0.001;


    float u1 = mod(u, 4. * ell_K);
    float sign = 1.;
    if (u1 > 2. * ell_K) {
        u1 = 4.* ell_K -u1;
        sign = -1.;
    }

    vec3 aux;

    if (u1 < tolerance) {
        aux = ellipjAtZero(u1);
    }
    else {
        aux = ellipj1(u1);
    }

    return vec3(sign * aux.x, aux.y, aux.z);
}


float ellipz(float tanPhi) {
    // Return the Jacobi Zeta function, whose argument is an angle phi passed as tan(phi), i.e.
    // Z(phi|m) = E(phi|m) - [E(m)/K(m)] * F(phi|m)
    // the argument is passed as tan(phi) since this is the way it is computed from the Jacboi function :
    // tan(phi) = sn(u|m) / cn(u|m)
    // This is useless to compute the atan and then apply tan!
    // Computed with the AGM algorithm, see §17.6 in [2]
    float tolerance = 0.001;


    float sign = 1.;
    float t0 = tanPhi;
    if (t0 < 0.) {
        t0 = - t0;
        sign = -1.;
    }

    float res = 0.;

    // if t0 is close to zero we use an asymptotic expansion around zero
    // (computed with SageMath)
    if (t0 < tolerance) {
        float k2 = ell_m;
        float k4 = k2 * ell_m;
        float k6 = k4 * ell_m;
        res =  - (ell_E /ell_K - 1.) * t0;
        res = res - (1./6.) * (ell_E * k2 / ell_K + k2 - 2. * ell_E / ell_K + 2.) * pow(t0, 3.);
        res = res - (1./40.) * (3. * ell_E * k4 / ell_K + k4 - 8. * ell_E * k2 / ell_K - 8. * k2 + 8. * ell_E / ell_K - 8.) * pow(t0, 5.);
        res = res - (1./112.) * (5. * ell_E * k6 / ell_K + k6 - 18. * ell_E * k4 / ell_K - 6. * k4 + 24. * ell_E * k2 / ell_K + 24. * k2 - 16. * ell_E / ell_K + 16.) * pow(t0, 7.);
    }
    else {
        // initializing the parameters of the induction

        float t1;// represent tan(phi_{n+1})
        float s1;// represent sin(phi_{n+1})
        float aux;

        for (int i = 0; i < AGMLength; i++) {
            aux = AGMList[i].y / AGMList[i].x;
            t1 = t0 * (1. + aux) / (1. - aux * t0 * t0);
            s1 = t0 * (1. + aux) / sqrt((1. + t0 * t0) * (1. + aux * aux * t0 * t0));
            res = res + AGMList[i + 1].z * s1;

            t0 = t1;
        }
    }
    return sign * res;
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
  Data type for manipulating points in the tangent bundle
  A tangVector is given by
  - pos : a point in the space
  - dir: a tangent vector at pos

  Implement various basic methods to manipulate them
*/

struct tangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// vector in the tangent space at the point pos
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------

Isometry makeLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}


Isometry makeInvLeftTranslation(tangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}


tangVector translate(Isometry A, tangVector v) {
    // over load to translate a direction
    return tangVector(A.matrix * v.pos, A.matrix * v.dir);
}


tangVector rotateFacing(mat4 A, tangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(v.pos, A*v.dir);
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


tangVector sub(tangVector v1, tangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return tangVector(v1.pos, v1.dir - v2.dir);
}


tangVector scalarMult(float a, tangVector v) {
    // scalar multiplication of a tangent vector
    return tangVector(v.pos, a * v.dir);
}

/*
tangVector translate(mat4 isom, tangVector v) {
    // apply an isometry to the tangent vector (both the point and the direction)
    return tangVector(isom * v.pos, isom * v.dir);
}

tangVector applyMatrixToDir(mat4 matrix, tangVector v) {
    // apply the given given matrix only to the direction of the tangent vector
    return tangVector(v.pos, matrix * v.dir);
}
*/


float tangDot(tangVector u, tangVector v){
    mat3 g = mat3(
    exp(-2. * u.pos.z), 0., 0.,
    0., exp(2. * u.pos.z), 0.,
    0., 0., 1.
    );
    return dot(u.dir.xyz, g * v.dir.xyz);

}


float tangNorm(tangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}


tangVector tangNormalize(tangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return tangVector(v.pos, v.dir/tangNorm(v));
}


float cosAng(tangVector u, tangVector v){
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
    agm();
    vec2 KE = ellipke();
    ell_K = KE.x;
    ell_E = KE.y;

    // if ab = 0 (hyperbolic sheets) then k' = 0, in which case, L will not be needed and makes no sense here
    if (ab != 0.) {
        ell_L = ell_E / (ell_kprime * ell_K) - 0.5 * ell_kprime;
    }

}


//----------------------------------------------------------------------------------------------------------------------
// STRUCT localTangVector
//----------------------------------------------------------------------------------------------------------------------

/*
  Another data type for manipulating points in the tangent bundler
  A localTangVector is given by
  - pos : a point in the space
  - dir: the pull back of the tangent vector by the (unique) element of Sol bringing pos to the origin

  This sould reduce numerical errors.

  Implement various basic methods to manipulate them
*/

struct localTangVector {
    vec4 pos;// position on the manifold
    vec4 dir;// pulled back tangent vector
};


//----------------------------------------------------------------------------------------------------------------------
// Applying Isometries, Facings
//----------------------------------------------------------------------------------------------------------------------

Isometry makeLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeLeftTranslation(v.pos);
}


Isometry makeInvLeftTranslation(localTangVector v) {
    // overlaod using tangVector
    return makeInvLeftTranslation(v.pos);
}


localTangVector translate(Isometry A, localTangVector v) {
    // over load to translate a direction
    // WARNING. Only works if A is an element of SOL.
    // Any more general isometry should also acts on the direction component
    return localTangVector(A.matrix * v.pos, v.dir);
}


localTangVector rotateFacing(mat4 A, localTangVector v){
    // apply an isometry to the tangent vector (both the point and the direction)
    return localTangVector(v.pos, A*v.dir);
}


//----------------------------------------------------------------------------------------------------------------------
// LOCAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods perfoming computations in the tangent space at a given point.
*/

localTangVector add(localTangVector v1, localTangVector v2) {
    // add two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir + v2.dir);
}

localTangVector sub(localTangVector v1, localTangVector v2) {
    // subtract two tangent vector at the same point
    // TODO : check if the underlyig point are indeed the same ?
    return localTangVector(v1.pos, v1.dir - v2.dir);
}

localTangVector scalarMult(float a, localTangVector v) {
    // scalar multiplication of a tangent vector
    return localTangVector(v.pos, a * v.dir);
}

float tangDot(localTangVector u, localTangVector v){
    return dot(u.dir.xyz, v.dir.xyz);

}

float tangNorm(localTangVector v){
    // calculate the length of a tangent vector
    return sqrt(tangDot(v, v));
}

localTangVector tangNormalize(localTangVector v){
    // create a unit tangent vector (in the tangle bundle)
    return localTangVector(v.pos, v.dir/tangNorm(v));
}

float cosAng(localTangVector u, localTangVector v){
    // cosAng between two vector in the tangent bundle
    return tangDot(u, v);
}


//----------------------------------------------------------------------------------------------------------------------
// CONVERSION BETWEEN TANGVECTOR AND LOCALTANGVECTOR
//----------------------------------------------------------------------------------------------------------------------

localTangVector toLocalTangVector(tangVector v) {
    Isometry isom = makeInvLeftTranslation(v.pos);
    localTangVector res = localTangVector(v.pos, translate(isom, v.dir));
    return tangNormalize(res);
}

tangVector toTangVector(localTangVector v) {
    Isometry isom = makeLeftTranslation(v.pos);
    tangVector res = tangVector(v.pos, translate(isom, v.dir));
    return tangNormalize(res);
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

float fakeDistance(localTangVector u, localTangVector v){
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

float exactDist(localTangVector u, localTangVector v){
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

tangVector tangDirection(localTangVector u, localTangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}


tangVector eucflow(tangVector tv, float t) {
    return tangVector(tv.pos + t * tv.dir, tv.dir);
}

tangVector numflow(tangVector tv, float t) {
    // follow the geodesic flow using a numerical integration
    // fix the noise for small steps
    float NUM_STEP = 0.2 * EPSILON;

    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);
    Isometry isomInv = makeInvLeftTranslation(tv);


    // pull back of the tangent vector at the origin
    tangVector tvOrigin = translate(isomInv, tv);

    // tangent vector used updated during the numerical integration
    tangVector aux = tvOrigin;

    // integrate numerically the flow
    int n = int(floor(t/NUM_STEP));
    for (int i = 0; i < n; i++){
        vec4 fieldPos = aux.dir;
        vec4 fieldDir = vec4(
        2. * aux.dir.x * aux.dir.z,
        -2. * aux.dir.y * aux.dir.z,
        -exp(-2. * aux.pos.z) * pow(aux.dir.x, 2.) + exp(2. * aux.pos.z) * pow(aux.dir.y, 2.),
        0
        );

        aux.pos = aux.pos + NUM_STEP * fieldPos;
        aux.dir = aux.dir + NUM_STEP * fieldDir;
        aux = tangNormalize(aux);
    }

    tangVector res = translate(isom, aux);
    res = tangNormalize(res);

    return res;

}


tangVector ellflow(tangVector tv, float t){
    // follow the geodesic flow during a time t

    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);
    Isometry isomInv = makeInvLeftTranslation(tv);

    // pull back of the tangent vector at the origin
    tangVector tvOrigin = translate(isomInv, tv);

    // result to be populated
    tangVector resOrigin = tangVector(ORIGIN, vec4(0.));

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tvOrigin.dir.x;
    float b = tvOrigin.dir.y;
    float c = tvOrigin.dir.z;

    // we need to distinguish three cases, depending on the type of geodesics

    // tolerance used between the difference cases
    //float tolerance = 0.0000001;

    //if (abs(a) < tolerance) {
    if (a == 0.) {
        // GEODESIC IN THE HYPERBOLIC SHEET X = 0
        float sht = sinh(t);
        float cht = cosh(t);
        float tht = sht/cht;

        resOrigin.pos = vec4(
        0.,
        b * sht / (cht + c * sht),
        log(cht + c * sht),
        1.
        );
        resOrigin.dir = vec4(
        0.,
        b / pow(cht + c * sht, 2.),
        (c + tht) / (1. + c * tht),
        0.
        );
    }
    //else if (abs(b) < tolerance) {
    else if (b == 0.) {
        // GEODESIC IN THE HYPERBOLIC SHEET Y = 0
        float sht = sinh(t);
        float cht = cosh(t);
        float tht = sht/cht;

        resOrigin.pos = vec4(
        a * sht / (cht - c * sht),
        0.,
        - log(cht - c * sht),
        1.
        );
        resOrigin.dir = vec4(
        a / pow(cht - c * sht, 2.),
        0.,
        (c - tht) / (1. - c * tht),
        0.
        );
    }
    else {

        // GENERIC CASE
        // In order to minimizes the computations we adopt the following trick
        // For long steps, i.e. if mu * t > 4K, then we only march by an integer multiple of the period 4K.
        // In this way, there is no elliptic function to compute : only the x,y coordinates are shifted by a translation
        // We only compute elliptic functions for small steps, i.e. if mu * t < 4K

        float steps = floor((ell_mu * t) / (4. * ell_K));

        if (steps > 0.5) {
            resOrigin.pos = vec4(ell_L * steps * 4. * ell_K, ell_L * steps * 4. * ell_K, 0., 1.);
            resOrigin.dir = vec4(a, b, c, 0.);
        }
        else {

            // parameters related to the initial condition of the geodesic flow

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

            // amplitude (without the phase shift of s0)
            // the functions we consider are 4K periodic, hence we can reduce the value of mu * t modulo 4K.
            // (more a safety check as we assumed that mu * t < 4K)
            float s = mod(ell_mu * t, 4. * ell_K);
            // jabobi functions applied to the amplitude s
            vec3 jacobi_s = ellipj(s);

            // jacobi function applied to mu * t + s0 = s + s0  (using addition formulas)
            float den = 1. - ell_m * jacobi_s.x * jacobi_s.x * jacobi_s0.x * jacobi_s0.x;
            vec3 jacobi_ss0 = vec3(
            (jacobi_s.x * jacobi_s0.y * jacobi_s0.z + jacobi_s0.x * jacobi_s.y * jacobi_s.z) / den,
            (jacobi_s.y * jacobi_s0.y - jacobi_s.x * jacobi_s.z * jacobi_s0.x * jacobi_s0.z) / den,
            (jacobi_s.z * jacobi_s0.z - ell_m * jacobi_s.x * jacobi_s.y * jacobi_s0.x * jacobi_s0.y) / den
            );

            // Z(mu * t + s0) - Z(s0) (using again addition formulas)
            float zetaj = ellipz(jacobi_s.x / jacobi_s.y) - ell_m * jacobi_s.x * jacobi_s0.x * jacobi_ss0.x;


            // wrapping all the computation
            resOrigin.pos = vec4(

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

            0.5 * log(abs(b / a)) + asinh(kOkprime * jacobi_ss0.y),

            1.
            );

            resOrigin.dir = vec4(

            signa * abs(b) * pow(kOkprime * jacobi_ss0.y + oneOkprime * jacobi_ss0.z, 2.),

            signb * abs(a) * pow(kOkprime * jacobi_ss0.y - oneOkprime * jacobi_ss0.z, 2.),

            - ell_k * ell_mu * jacobi_ss0.x,

            0.
            );
        }
    }

    resOrigin = tangNormalize(resOrigin);
    tangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;

}

tangVector flow(tangVector tv, float t) {

    if (abs(t) < 50. * EPSILON) {
        return numflow(tv, t);
        //return ellflow(tv, t);
    }
    else {
        return ellflow(tv, t);
    }
}



localTangVector numflow(localTangVector tv, float t) {
    // follow the geodesic flow during time t
    // using a numerical integration
    // fix the noise for small steps
    float NUM_STEP = 0.2 * EPSILON;

    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);

    // tangent vector used updated during the numerical integration
    localTangVector aux = localTangVector(ORIGIN, tv.dir);

    // integrate numerically the flow
    int n = int(floor(t/NUM_STEP));
    for (int i = 0; i < n; i++){
        vec4 fieldPos = vec4(
        exp(aux.pos.z) * aux.dir.x,
        exp(-aux.pos.z) * aux.dir.y,
        aux.dir.z,
        0
        );
        vec4 fieldDir = vec4(
        aux.dir.x * aux.dir.z,
        -aux.dir.y * aux.dir.z,
        -pow(aux.dir.x, 2.) + pow(aux.dir.y, 2.),
        0
        );

        aux.pos = aux.pos + NUM_STEP * fieldPos;
        aux.dir = aux.dir + NUM_STEP * fieldDir;
        aux = tangNormalize(aux);
    }

    localTangVector res = translate(isom, aux);
    res = tangNormalize(res);

    return res;

}


localTangVector hypXflow(localTangVector tv, float t) {
    // flow in (the neighborhood of) the hyperbolic sheets {x = 0}
    // use an taylor expansion at the order 2 around a = 0
    // if need one could use a higher order expansion...
    // one "just" need to do a few ugly computations before!


    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);

    // result to be populated
    localTangVector resOrigin = localTangVector(ORIGIN, vec4(0.));

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tv.dir.x;
    float b = tv.dir.y;
    float c = tv.dir.z;

    // preparing the material to write down the formula in an easy way
    // and avoid redundant computation
    // look at the notes for the definitions of all the quantities

    // norm of the yz component of the tagent vector, i.e. sqrt(b^2 + c^2)
    float n = sqrt(b * b + c * c);
    // sign of b
    float sign = 1.;
    if (b < 0.) {
        sign = -1.;
    }
    // cosh(n(t+t_0)) and sinh(n(t+t_0))
    float shntt0 = (c * cosh(n * t) + n * sinh(n * t)) / abs(b);
    float chntt0 = (n * cosh(n * t) + c * sinh(n * t)) / abs(b);


    // first term in the asymptotic expansion of the direction
    vec4 u0 = vec4(
    0,
    sign * n / chntt0,
    n * shntt0 / chntt0,
    0
    );

    // second term in the asymptotic expansion of the direction
    vec4 u1 = vec4(
    abs(b) * chntt0 / n,
    0,
    0,
    0
    );

    // third term in the asymptotic expansion of the direction
    float denz = 4. * n * pow(chntt0, 2.);
    float deny = pow(n, 2.) * denz;

    vec4 u2 = vec4(
    0,
    sign * (
    pow(b, 2.) * chntt0 * pow(shntt0, 2.)
    + 2 * pow(c, 2.) * chntt0
    + n * ((pow(b, 2.) - 2 * pow(c, 2.)) * t - 3. * c) * shntt0
    )/ deny,
    -(
    (2 * pow(b, 2.) * pow(chntt0, 2.) + pow(b, 2.) - 2 * pow(c, 2.)) * chntt0 * shntt0
    + n * ((pow(b, 2.) - 2 * pow(c, 2.)) * t - 3. * c)
    ) / denz,
    0
    );

    resOrigin.dir = u0 + a * u1 + a * a * u2;

    resOrigin.pos = vec4(
    0.,
    b * sht / (cht + c * sht),
    log(cht + c * sht),
    1.
    );
    resOrigin.dir = vec4(
    0.,
    b / (cht + c * sht),
    (c + tht) / (1. + c * tht),
    0.
    );


    resOrigin = tangNormalize(resOrigin);
    localTangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;

}


localTangVector hypYflow(localTangVector tv, float t) {
    // flow in (the neighborhood of) the hyperbolic sheets {y = 0}


    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);

    // result to be populated
    localTangVector resOrigin = localTangVector(ORIGIN, vec4(0.));

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tv.dir.x;
    float b = tv.dir.y;
    float c = tv.dir.z;

    float sht = sinh(t);
    float cht = cosh(t);
    float tht = sht/cht;

    resOrigin.pos = vec4(
    a * sht / (cht - c * sht),
    0.,
    - log(cht - c * sht),
    1.
    );
    resOrigin.dir = vec4(
    a / (cht - c * sht),
    0.,
    (c - tht) / (1. - c * tht),
    0.
    );

    resOrigin = tangNormalize(resOrigin);
    localTangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;

}


localTangVector ellflow(localTangVector tv, float t){
    // follow the geodesic flow during a time t
    // generic case

    // Isometry moving back to the origin and conversely
    Isometry isom = makeLeftTranslation(tv);

    // result to be populated
    localTangVector resOrigin = localTangVector(ORIGIN, vec4(0.));

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tv.dir.x;
    float b = tv.dir.y;
    float c = tv.dir.z;


    // In order to minimizes the computations we adopt the following trick
    // For long steps, i.e. if mu * t > 4K, then we only march by an integer multiple of the period 4K.
    // In this way, there is no elliptic function to compute : only the x,y coordinates are shifted by a translation
    // We only compute elliptic functions for small steps, i.e. if mu * t < 4K

    float steps = floor((ell_mu * t) / (4. * ell_K));

    if (steps > 0.5) {
        resOrigin.pos = vec4(ell_L * steps * 4. * ell_K, ell_L * steps * 4. * ell_K, 0., 1.);
        resOrigin.dir = vec4(a, b, c, 0.);
    }
    else {

        // parameters related to the initial condition of the geodesic flow

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

        // amplitude (without the phase shift of s0)
        // the functions we consider are 4K periodic, hence we can reduce the value of mu * t modulo 4K.
        // (more a safety check as we assumed that mu * t < 4K)
        float s = mod(ell_mu * t, 4. * ell_K);
        // jabobi functions applied to the amplitude s
        vec3 jacobi_s = ellipj(s);

        // jacobi function applied to mu * t + s0 = s + s0  (using addition formulas)
        float den = 1. - ell_m * jacobi_s.x * jacobi_s.x * jacobi_s0.x * jacobi_s0.x;
        vec3 jacobi_ss0 = vec3(
        (jacobi_s.x * jacobi_s0.y * jacobi_s0.z + jacobi_s0.x * jacobi_s.y * jacobi_s.z) / den,
        (jacobi_s.y * jacobi_s0.y - jacobi_s.x * jacobi_s.z * jacobi_s0.x * jacobi_s0.z) / den,
        (jacobi_s.z * jacobi_s0.z - ell_m * jacobi_s.x * jacobi_s.y * jacobi_s0.x * jacobi_s0.y) / den
        );

        // Z(mu * t + s0) - Z(s0) (using again addition formulas)
        float zetaj = ellipz(jacobi_s.x / jacobi_s.y) - ell_m * jacobi_s.x * jacobi_s0.x * jacobi_ss0.x;


        // wrapping all the computation
        resOrigin.pos = vec4(

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

        0.5 * log(abs(b / a)) + asinh(kOkprime * jacobi_ss0.y),

        1.
        );

        resOrigin.dir = vec4(

        a * sqrt(abs(b/a)) * (kOkprime * jacobi_ss0.y + oneOkprime * jacobi_ss0.z),


        - b * sqrt(abs(a/b)) * (kOkprime * jacobi_ss0.y - oneOkprime * jacobi_ss0.z),

        - ell_k * ell_mu * jacobi_ss0.x,

        0.
        );
    }

    resOrigin = tangNormalize(resOrigin);
    localTangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;

}


localTangVector flow(localTangVector tv, float t) {

    if (abs(t) < 50. * EPSILON) {
        return numflow(tv, t);
        //return ellflow(tv, t);
    }
    else {
        if (tv.dir.x==0.) {
            return hypXflow(tv, t);
        }
        else if (tv.dir.y==0.) {
            return hypYflow(tv, t);
        }
        else {
            return ellflow(tv, t);
        }
    }
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


float ellipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x, p.y, p.z/2., 1.), center) - radius;
}

float fatEllipsoidSDF(vec4 p, vec4 center, float radius){
    return exactDist(vec4(p.x/10., p.y/10., p.z, 1.), center) - radius;
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


float sliceSDF(vec4 p) {
    float HS1= 0.;
    HS1=horizontalHalfSpaceSDF(p, -0.1);
    float HS2=0.;
    HS2=-horizontalHalfSpaceSDF(p, -1.);
    return max(HS1, HS2);
}

float cylSDF(vec4 p, float r){
    return sphereSDF(vec4(p.x, p.y, 0., 1.), ORIGIN, r);
}

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
uniform float time;
uniform float lightRad;

uniform int display;
// 1=tiling
// 2= planes
// 3= dragon skin

uniform int res;

//adding one local light (more to follow)
vec4 localLightPos=vec4(0.1, 0.1, -0.2, 1.);
vec4 localLightColor=vec4(1., 1., 1., 0.2);

//variable which sets the light colors for drawing in hitWhich 1
vec3 colorOfLight=vec3(1., 1., 1.);


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
    float tilingDist;
    float dragonDist;
    float planesDist;
    float lightDist;
    float distance = MAX_DIST;

    lightDist=sphereSDF(p, localLightPos, lightRad);
    distance=min(distance, lightDist);
    if (lightDist < EPSILON){
        //LIGHT=true;
        hitWhich = 1;
        colorOfLight=vec3(1., 1., 1.);
        return lightDist;
    }

    if (display==3){ //dragon
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==4){ //dragon tiling
        vec4 center = vec4(0., 0., 0., 1.);;
        float dragonDist = fatEllipsoidSDF(p, center, 0.03);
        distance = min(distance, dragonDist);
        if (dragonDist<EPSILON){
            //LIGHT=false;
            hitWhich=3;
            return dragonDist;
        }

    }

    if (display==1){ //tiling
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = ellipsoidSDF(p, center, 0.32);
        tilingDist=-sphere;


        //cut out a vertical cylinder to poke holes in the top, bottom
        //    float cyl=0.0;
        //    cyl=cylSDF(p,0.2);
        //    tilingDist= -min(sphere, cyl);
        //

        //instead, cut out two balls from the top, bottom
        //right now not working well because of the sphere distance function
        //    float topSph=0.0;
        //    float bottomSph=0.0;
        //    float spheres=0.;
        //    topSph=sphereSDF(p, vec4(0.,0.,z0,1.),0.7);
        //    bottomSph=sphereSDF(p, vec4(0.,0.,-z0,1.),0.7);
        //    spheres=min(topSph,bottomSph);
        //    tilingDist=-min(sphere,spheres);

        distance=min(distance, tilingDist);

        if (tilingDist < EPSILON){
            // LIGHT=false;
            hitWhich=3;
            return tilingDist;
        }
    }

    if (display==2){ //planes
        vec4 center = vec4(0., 0., 0., 1.);
        float sphere=0.;
        sphere = sphereSDF(p, center, 0.5);

        planesDist = -sphere;
        distance=min(distance, planesDist);
        if (planesDist < EPSILON){

            hitWhich=3;
            return planesDist;
        }
    }
    return distance;
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

    float objDist = sliceSDF(absolutep);
    //float slabDist;
    //float sphDist;
    //slabDist = sliceSDF(absolutep);
    //sphDist=sphereSDF(absolutep,vec4(0.,0.,-0.2,1.),0.5);
    //objDist=max(slabDist,-sphDist);
    // objDist=MAX_DIST;


    //global plane


    //    vec4 globalObjPos=translate(globalObjectBoost, ORIGIN);
    //    //objDist = sphereSDF(absolutep, vec4(sqrt(6.26), sqrt(6.28), 0., 1.), globalSphereRad);
    //    objDist = sphereSDF(absolutep, globalObjPos, 0.1);
    //
    //
    //
    //    distance = min(distance, objDist);
    //    if (distance < EPSILON){
    //        hitWhich = 2;
    //    }


    return distance;
    // return MAX_DIST;
}


// check if the given point p is in the fundamental domain of the lattice.

float denominator=GoldenRatio+2.;

bool isOutsideCell(vec4 p, out Isometry fixMatrix){
    //vec4 ModelP= modelProject(p);


    //lattice basis divided by the norm square
    vec4 v1 = vec4(GoldenRatio, -1., 0., 0.);
    vec4 v2 = vec4(1., GoldenRatio, 0., 0.);
    vec4 v3 = vec4(0., 0., 1./z0, 0.);

    if (display!=3){
        if (dot(p, v3) > 0.5) {
            fixMatrix = Isometry(invGenerators[4]);
            return true;
        }
        if (dot(p, v3) < -0.5) {
            fixMatrix = Isometry(invGenerators[5]);
            return true;
        }
    }

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


// overload of the previous method with local tangent vector
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
                float localDist = min(5., localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    // hitWhich = 3;
                    sampletv = localtv;
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else {
        localDepth=MAX_DIST;
    }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 15) {
                hitWhich = 5;
                debugColor = 10000. * vec3(0, 0, marchStep);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identityIsometry;
                sampletv = tv;
                //hitWhich = 5;
                //debugColor = 0.1*vec3(globalDepth, 0, 0);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(0, globalDepth, 0);
                break;
            }
        }
        /*
        if(hitWhich == 0) {
            hitWhich = 5;
            debugColor = 0.1*vec3(0, 0, globalDepth);
        }
        */
    }
}


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
// done with local vectors

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){
    Isometry fixMatrix;
    float marchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    totalFixMatrix = identityIsometry;


    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            localtv = flow(localtv, marchStep);

            if (isOutsideCell(localtv, fixMatrix)){
                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
                localtv = translate(fixMatrix, localtv);
                localtv=tangNormalize(localtv);
                marchStep = MIN_DIST;
            }
            else {
                float localDist = min(.5, localSceneSDF(localtv.pos));
                if (localDist < EPSILON){
                    //hitWhich = 3;
                    sampletv = toTangVector(localtv);
                    break;
                }
                marchStep = localDist;
                globalDepth += localDist;
            }
        }
        localDepth = min(globalDepth, MAX_DIST);
    }
    else {
        localDepth=MAX_DIST;
    }


    if (GLOBAL_SCENE){
        globalDepth = MIN_DIST;
        marchStep = MIN_DIST;

        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            tv = flow(tv, marchStep);

            /*
            if (i == 15) {
                hitWhich = 5;
                debugColor = 10000. * vec3(0, 0, marchStep);
                break;
            }
            */

            float globalDist = globalSceneSDF(tv.pos);
            if (globalDist < EPSILON){
                // hitWhich has now been set
                totalFixMatrix = identityIsometry;
                sampletv = toTangVector(tv);
                //hitWhich = 5;
                //debugColor = 0.1*vec3(globalDepth, 0, 0);
                return;
            }
            marchStep = globalDist;
            globalDepth += globalDist;
            if (globalDepth >= localDepth){
                //hitWhich = 5;
                //debugColor = vec3(0, globalDepth, 0);
                break;
            }
        }
        /*
        if(hitWhich == 0) {
            hitWhich = 5;
            debugColor = 0.1*vec3(0, 0, globalDepth);
        }
        */
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

    vec3 surfColor;
    surfColor=0.2*vec3(1.)+0.8*color;

    if (display==3||display==4){ //for the dragon skin one only
        surfColor=0.7*vec3(1.)+0.3*color;//make it brighter when there's less stuff
    }
    //    vec3 color = vec3(0.0);
    //--------------------------------------------------
    //Lighting Calculations
    //--------------------------------------------------
    //usually we'd check to ensure there are 4 lights
    //however this is version is hardcoded so we won't

    //GLOBAL LIGHTS THAT WE DONT ACTUALLY RENDER
    for (int i = 0; i<4; i++){
        Isometry totalIsom=composeIsometry(totalFixMatrix, invCellBoost);
        TLP = translate(totalIsom, lightPositions[i]);
        color += lightingCalculations(SP, TLP, V, surfColor, lightIntensities[i]);
    }


    //LOCAL LIGHT
    color+= lightingCalculations(SP, localLightPos, V, surfColor, localLightColor);
    //light color and intensity hard coded in


    //move local light around by the generators to pick up lighting from nearby cells
    for (int i=0; i<6; i++){
        TLP=invGenerators[i]*localLightPos;
        color+= lightingCalculations(SP, TLP, V, surfColor, localLightColor);
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


vec3 lightColor(Isometry totalFixMatrix, tangVector sampletv, vec3  colorOfLight){

    N = estimateNormal(sampletv.pos);
    vec3 color;
    color = phongModel(totalFixMatrix, 0.5*colorOfLight);
    color = 0.7*color+0.3;
    return color;

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
        vec3 color=localLightColor.xyz;
        color = phongModel(totalFixMatrix, 0.5*color);
        color = 0.7*color+0.3;
        return color;


        //generically gray object (color= black, glowing slightly because of the 0.1)
    }
}


vec3 tilingColor(Isometry totalFixMatrix, tangVector sampletv){
    //    if (FAKE_LIGHT){//always fake light in Sol so far

    //make the objects have their own color
    //color the object based on its position in the cube
    vec4 samplePos=modelProject(sampletv.pos);

    //IF WE HIT THE TILING
    float x=samplePos.x;
    float y=samplePos.y;
    float z=samplePos.z;
    x = 0.9 * x / modelHalfCube;
    y = 0.9 * y / modelHalfCube;
    z = 0.9 * z / modelHalfCube;
    vec3 color = vec3(x, y, z);

    N = estimateNormal(sampletv.pos);
    color = phongModel(totalFixMatrix, 0.1*color);

    return 0.9*color+0.1;

    //adding a small constant makes it glow slightly
    //}
    //    else {
    //        //if we are doing TRUE LIGHTING
    //        // objects have no natural color, only lit by the lights
    //        N = estimateNormal(sampletv.pos);
    //        vec3 color=vec3(0., 0., 0.);
    //        color = phongModel(totalFixMatrix, color);
    //        return color;
    //    }
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
    setResolution(res);
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
    //raymarch(rayDir, totalFixMatrix);
    raymarch(toLocalTangVector(rayDir), totalFixMatrix);

    /*
    hitWhich = 5;

    float aux = ellipj(0.0001 * time * ell_K).x;
    if (aux > 0.){
        debugColor = vec3(aux, 0, 0);
    }
    else {
        debugColor = vec3(0, -aux, 0);
    }
    */


    //Based on hitWhich decide whether we hit a global object, local object, or nothing
    if (hitWhich == 0){ //Didn't hit anything ------------------------
        //COLOR THE FRAME DARK GRAY
        //0.2 is medium gray, 0 is black
        out_FragColor = vec4(0.3);
        return;
    }
    else if (hitWhich == 1){
        // global lights
        vec3 pixelColor= lightColor(totalFixMatrix, sampletv, colorOfLight);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich == 5){
        //debug
        out_FragColor = vec4(debugColor, 1.0);
        return;
    }
    else if (hitWhich == 2){
        // global object
        vec3 pixelColor= ballColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }
    else if (hitWhich==3) {
        // local objects
        vec3 pixelColor= tilingColor(totalFixMatrix, sampletv);
        out_FragColor=vec4(pixelColor, 1.0);
        return;
    }

}