
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

int hitWhich = 0;

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
    localTangVector resOrigin;

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = tv.dir.x;
    float b = tv.dir.y;
    float c = tv.dir.z;

    // preparing the material to write down the formula in an easy way
    // and avoid redundant computation
    // look at the notes for the definitions of all the quantities


    float b2 = b * b;
    float c2 = c * c;
    // norm of the yz component of the tagent vector, i.e. sqrt(b^2 + c^2) and its powsers
    float n1 = sqrt(b2 + c2);
    float n2 = n1 * n1;
    float n3 = n1 * n2;
    float n4 = n1 * n3;
    // sign of b
    float sign = 1.;
    if (b < 0.) {
        sign = -1.;
    }
    // cosh(s), sinh(s), and tanh(s) where s = n(t+t0)
    float shs = (c * cosh(n1 * t) + n1 * sinh(n1 * t)) / abs(b);
    float chs = (n1 * cosh(n1 * t) + c * sinh(n1 * t)) / abs(b);
    float ths = shs / chs;


    vec4 u0 = vec4(
    0.,
    sign * n1 / chs,
    n1 * ths,
    0.
    );

    vec4 u1 = vec4(
    abs(b) * chs / n1,
    0.,
    0.,
    0.
    );

    vec4 u2 = vec4(
    0.,
    sign * b2 * chs / (4. * n3)
    + sign * (b2 - 2. * c2)  * (n1 * t * shs / pow(chs, 2.) - 1. / chs) / (4. * n3)
    - 3. * sign * c * shs / (4. * n2 * pow(chs, 2.)),
    - b2 * shs * chs / (2. * n3)
    - (b2 - 2. * c2) * (ths - n1 * t / pow(chs, 2.)) / (4. * n3)
    + 3. * c / (4. * n2 * pow(chs, 2.)),
    0.
    );

    resOrigin.dir = u0  + a * u1 + a * a * u2;


    vec4 p0 = vec4(
    0.,
    n1 * ths / b - c / b,
    log(abs(b) * chs / n1),
    1.
    );

    vec4 p1 = vec4(
    b2 * (shs * chs + n1 * t) / (2. * n3) - c / (2. * n2),
    0.,
    0.,
    0.
    );

    vec4 p2 = vec4(
    0.,
    b * n1 * t / (2. * n3)
    - (b2 - 2. * c2) * ( n1 * t / pow(chs, 2.) + ths) / (4. * b * n3)
    + 3. * c / (4. * b * n2 * pow(chs, 2.))
    - c / (2. * b * n2),
    - b2 * pow(chs, 2.) / (4. * n4)
    - (b2 - 2. * c2) * (n1 * t * ths - 1.) / (4. * n4)
    + 3. * c * ths / (4. * n3),
    0.
    );

    resOrigin.pos = p0 + a * p1 + a * a * p2;


    resOrigin = tangNormalize(resOrigin);
    localTangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;
}


localTangVector hypYflow(localTangVector tv, float t) {
    // flow in (the neighborhood of) the hyperbolic sheets {y = 0}

    localTangVector tvAux;
    tvAux.pos = vec4(tv.pos.y, tv.pos.x, -tv.pos.z, 1.);
    tvAux.dir = vec4(tv.dir.y, tv.dir.x, -tv.dir.z, 0.);

    localTangVector resAux = hypXflow(tvAux, t);
    localTangVector res;
    res.pos = vec4(resAux.pos.y, resAux.pos.x, -resAux.pos.z, 1.);
    res.dir = vec4(resAux.dir.y, resAux.dir.x, -resAux.dir.z, 0.);

    res = tangNormalize(res);

    return res;
}


/*

localTangVector hypYflow(localTangVector tv, float t) {
    // flow in (the neighborhood of) the hyperbolic sheets {y = 0}
    // use an taylor expansion at the order 2 around b = 0
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


    float a2 = a * a;
    float c2 = c * c;
    // norm of the xz component of the tagent vector, i.e. sqrt(a^2 + c^2) and its powsers
    float n1 = sqrt(a2 + c2);
    float n2 = n1 * n1;
    float n3 = n1 * n2;
    float n4 = n1 * n3;
    // sign of b
    float sign = 1.;
    if (a < 0.) {
        sign = -1.;
    }
    // cosh(s), sinh(s), and tanh(s) where s = n(t+t0)
    float shs = (-c * cosh(n1 * t) + n1 * sinh(n1 * t)) / abs(a);
    float chs = (n1 * cosh(n1 * t) - c * sinh(n1 * t)) / abs(a);
    float ths = shs / chs;


    vec4 u0 = vec4(
    sign * n1 / chs,
    0,
    - n1 * ths,
    0
    );

    vec4 u1 = vec4(
    0,
    abs(a) * chs / n1,
    0,
    0
    );

    vec4 u2 = vec4(
    sign * a2 * chs / (4. * n3)
    + sign * (a2 + 2. * c2)  * (n1 * t * shs / pow(chs, 2.) - 1. / chs) / (4. * n3)
    + 3. * sign * c * shs / (4. * n2 * pow(chs, 2.)),
    0,
    a2 * shs * chs / (2. * n3)
    + (a2 + 2. * c2) * (ths - n1 * t / pow(chs, 2.)) / (4. * n3)
    + 3. * c / (4. * n2 * pow(chs, 2.)),
    0
    );

    resOrigin.dir = u0 + b * u1 + b * b * u2;


    vec4 p0 = vec4(
    n1 * ths / a + c / a,
    0,
    - log(abs(a) * chs / n1),
    1
    );

    vec4 p1 = vec4(
    0,
    a2 * (shs * chs + n1 * t) / (2. * n3) + c / (2. * n2),
    0,
    0
    );

    vec4 p2 = vec4(
    a * n1 * t / (2. * n3)
    - (a2 + 2. * c2) * ( n1 * t / pow(chs, 2.) + ths) / (4. * a * n3)
    - 3. * c / (4. * a * n2 * pow(chs, 2.))
    + c / (2. * a * n2),
    0,
    a2 * pow(chs, 2.) / (4. * n4)
    + (a2 + 2. * c2) * (n1 * t * ths - 1.) / (4. * n4)
    + 3. * c * ths / (4. * n3),
    0
    );

    resOrigin.pos = p0 + b * p1 + b * b * p2;


    resOrigin = tangNormalize(resOrigin);
    localTangVector res = translate(isom, resOrigin);
    res = tangNormalize(res);

    return res;

}

*/

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

    float tolerance = 0.0001;

    if (abs(t) < 50. * EPSILON) {
        return numflow(tv, t);
        //return ellflow(tv, t);
    }
    else {
        if (abs(tv.dir.x * t) < tolerance) {
        //if (tv.dir.x ==0.) {
            return hypXflow(tv, t);
        }
        else if (abs(tv.dir.y * t) < tolerance) {
        //else if (tv.dir.y ==0.) {
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
Isometry identityIsometry=Isometry(mat4(1.0));

Isometry currentBoost;
Isometry leftBoost;
Isometry rightBoost;
Isometry cellBoost;
Isometry invCellBoost;
Isometry globalObjectBoost;


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
        vec4 center = vec4(0., 0., 0., 1.);
        float dragonDist = ellipsoidSDF(p, center, 0.2);
        //float dragonDist = fatEllipsoidSDF(p, center, 0.03);
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
        sphere = ellipsoidSDF(p, center, 0.35);
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

//void raymarch(tangVector rayDir, out Isometry totalFixMatrix){
//    Isometry fixMatrix;
//    float marchStep = MIN_DIST;
//    float globalDepth = MIN_DIST;
//    float localDepth = MIN_DIST;
//    tangVector tv = rayDir;
//    tangVector localtv = rayDir;
//    totalFixMatrix = identityIsometry;
//
//
//    // Trace the local scene, then the global scene:
//
//    if (TILING_SCENE){
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            localtv = flow(localtv, marchStep);
//
//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                marchStep = MIN_DIST;
//            }
//            else {
//                float localDist = min(5., localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    // hitWhich = 3;
//                    sampletv = localtv;
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }
//
//
//    if (GLOBAL_SCENE){
//        globalDepth = MIN_DIST;
//        marchStep = MIN_DIST;
//
//        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
//            tv = flow(tv, marchStep);
//
//            /*
//            if (i == 15) {
//                hitWhich = 5;
//                debugColor = 10000. * vec3(0, 0, marchStep);
//                break;
//            }
//            */
//
//            float globalDist = globalSceneSDF(tv.pos);
//            if (globalDist < EPSILON){
//                // hitWhich has now been set
//                totalFixMatrix = identityIsometry;
//                sampletv = tv;
//                //hitWhich = 5;
//                //debugColor = 0.1*vec3(globalDepth, 0, 0);
//                return;
//            }
//            marchStep = globalDist;
//            globalDepth += globalDist;
//            if (globalDepth >= localDepth){
//                //hitWhich = 5;
//                //debugColor = vec3(0, globalDepth, 0);
//                break;
//            }
//        }
//        /*
//        if(hitWhich == 0) {
//            hitWhich = 5;
//            debugColor = 0.1*vec3(0, 0, globalDepth);
//        }
//        */
//    }
//}


// variation on the raymarch algorithm
// now each step is the march is made from the previously achieved position (useful later for Sol).
// done with local vectors

int BINARY_SEARCH_STEPS=6;

void raymarch(localTangVector rayDir, out Isometry totalFixMatrix){

    Isometry fixMatrix;
    Isometry testFixMatrix;
    float marchStep = MIN_DIST;
    float testMarchStep = MIN_DIST;
    float globalDepth = MIN_DIST;
    float localDepth = MIN_DIST;
    localTangVector tv = rayDir;
    localTangVector localtv = rayDir;
    localTangVector testlocaltv = rayDir;
    localTangVector bestlocaltv = rayDir;
    totalFixMatrix = identityIsometry;
    // Trace the local scene, then the global scene:

    if (TILING_SCENE){
        
        
        
        for (int i = 0; i < MAX_MARCHING_STEPS; i++){
            float localDist = localSceneSDF(localtv.pos);
            
            
            if (localDist < EPSILON){
                  sampletv = toTangVector(localtv);
                  break;
              }
              marchStep = localDist;
            
            //localtv = flow(localtv, marchStep);

//            if (isOutsideCell(localtv, fixMatrix)){
//                totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
//                localtv = translate(fixMatrix, localtv);
//                localtv=tangNormalize(localtv);
//                marchStep = MIN_DIST;
//            }
            
        testlocaltv = flow(localtv, marchStep);
        if (isOutsideCell(testlocaltv, fixMatrix)){
            bestlocaltv = testlocaltv;
            
            for (int j = 0; j < BINARY_SEARCH_STEPS; j++){
              ////// do binary search to get close to but outside this cell - 
              ////// dont jump too far forwards, since localSDF can't see stuff in the next cube
              testMarchStep = marchStep - pow(0.5,float(j+1))*localDist;
              testlocaltv = flow(localtv, testMarchStep);
              if ( isOutsideCell(testlocaltv, testFixMatrix) ){
                marchStep = testMarchStep;
                bestlocaltv = testlocaltv;
                fixMatrix = testFixMatrix;
              }
            }
            
            localtv = bestlocaltv;
            totalFixMatrix = composeIsometry(fixMatrix, totalFixMatrix);
            localtv = translate(fixMatrix, localtv);
            localtv=tangNormalize(localtv);
            //globalDepth += marchStep; 
            marchStep = MIN_DIST;
      }
            
                  else{ 
          localtv = testlocaltv; 
          globalDepth += marchStep; 
        }
      }
      localDepth=min(globalDepth, MAX_DIST);
    }
    else{localDepth=MAX_DIST;}


            
//            else {
//                float localDist = min(.5, localSceneSDF(localtv.pos));
//                if (localDist < EPSILON){
//                    //hitWhich = 3;
//                    sampletv = toTangVector(localtv);
//                    break;
//                }
//                marchStep = localDist;
//                globalDepth += localDist;
//            }
//        }
//        localDepth = min(globalDepth, MAX_DIST);
//    }
//    else {
//        localDepth=MAX_DIST;
//    }


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


