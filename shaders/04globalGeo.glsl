//----------------------------------------------------------------------------------------------------------------------
// GLOBAL GEOMETRY
//----------------------------------------------------------------------------------------------------------------------

/*
  Methods computing ``global'' objects
*/


float _fakeDistToOrigin(Point p) {
    vec4 aux = toVec4(p);
    vec3 oh = vec3(0, 0, 1);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(aux.xyz, J * oh);

    // WARNING: DO NOT THE 'IF ... THEN .. ELSE' STATEMENT BELOW
    // This hack is intended to make sure that q < -1, so that acosh does not crash
    // However when q is very large (long geodesics close to the horizontal component) the max causes numerical errors
    // This seems to work...
    // NB. Teleportation on the Javascript side does not fix the issue
    float fix;
    if (-q < 2.) fix = max(1., -q); else fix = -q;
    return 0.5 * sqrt(pow(acosh(fix), 2.) + pow(aux.w, 2.));
}

// fake distance between two points
float fakeDist(Point p1, Point p2){

    Isometry shift = makeInvLeftTranslation(p1);
    return _fakeDistToOrigin(translate(shift, p2));

    // vec4 aux1 = toVec4(p1);
    // vec4 aux2 = toVec4(p2);
    // return length(aux2 - aux1);
}

// overload of the previous function in case we work with tangent vectors
float fakeDist(Vector v1, Vector v2){
    return fakeDist(v1.pos, v2.pos);
}


//-----------------------------------------------------------------------
// Binary search / Newton method for computing the exact distance
//-----------------------------------------------------------------------


// TODO. Use asymptotic expansion around the parabolic type geodesics?


// consider a geodesic gamma from the origin describing an angle phi
// when reaching the point at distance rho of the axis (O,w)
// return the value of 0.5(w - w0), where w is the height of gamma at that point
// the distance rho is pased as sh(rho/2)^2
// We assume that rho > 0, w0 >=0, and phi < 0

// CHECKED (with SageMath)
float _height(float shRhoOver2SQ, float w0, float phi) {
    float shRhoOver2 = sqrt(shRhoOver2SQ);
    float chRhoOver2 = sqrt(1. + shRhoOver2SQ);
    float tanPhi = tan(phi);
    float tanPhiSQ = pow(tanPhi, 2.);
    float aux;
    float res;

    if (phi > - 0.5 * PI && tanPhi > - shRhoOver2) {
        // hyperbolic like geodesics
        aux = sqrt(shRhoOver2SQ - tanPhiSQ) / chRhoOver2;
        res = -0.5 * w0 + phi - 2. * tanPhi * atanh(aux) / aux;
    }
    else if (phi > - 0.5 * PI && tanPhi == - shRhoOver2) {
        // parabolic like geodesics
        res = -0.5 * w0 + phi - 2. * tanPhi;
    }
    else if (abs(tanPhi) > shRhoOver2){
        // elliptic like geodesics
        float test = mod(phi + 0.5 * PI, PI);
        if (test != 0.) {
            float eps = sign(tanPhi);
            float m = floor(0.5 - phi / PI);
            aux = sqrt(tanPhiSQ - shRhoOver2SQ) / chRhoOver2;
            res = - 0.5 * w0 + phi  - 2. * tanPhi * (atan(aux) - eps * m * PI) / aux;
        }
        else {
            res = - 0.5 * w0  + phi - 2. * phi * chRhoOver2;
        }
    }

    return res;
}

// derivative with repsect to phi of the function _height
// CHECKED (with SageMath)
float _dheight(float shRhoOver2SQ, float w0, float phi) {
    float shRhoOver2 = sqrt(shRhoOver2SQ);
    float chRhoOver2 = sqrt(1. + shRhoOver2SQ);
    float tanPhi = tan(phi);
    float tanPhiSQ = pow(tanPhi, 2.);
    float aux;
    float res;


    if (phi > - 0.5 * PI && tanPhi > - shRhoOver2) {
        // hyperbolic like geodesics
        aux = sqrt(shRhoOver2SQ - tanPhiSQ) / chRhoOver2;
        res = - 2. * (atanh(aux) / aux - 1.) * (1. / pow(aux, 2.) - 1.) * shRhoOver2SQ - 1.;
    }
    else if (phi > - 0.5 * PI && tanPhi == - shRhoOver2) {
        // parabolic like geodesics
        res = -(2. / 3.) * shRhoOver2SQ - 1.;
    }
    else if (abs(tanPhi) > shRhoOver2){
        // elliptic like geodesics
        float test = mod(phi + 0.5 * PI, PI);
        if (test != 0.) {
            float eps = sign(tanPhi);
            float m = floor(0.5 - phi / PI);
            aux = sqrt(tanPhiSQ - shRhoOver2SQ) / chRhoOver2;
            res = - 2. * (eps * m * PI / aux - atan(aux) / aux + 1.) * (1. / pow(aux, 2.) + 1.) * shRhoOver2SQ - 1.;
        }
        else {
            res = - 2. * shRhoOver2SQ - 1.;
        }
    }
    return res;
}

// assume that a geodesic starting from the origin reach the point q
// after describing an angle theta (in the hyperbolic plane)
// return the length of this geodesic
// we assume that rho > 0, w > 0, and phi < 0
// CHECKED (with SageMath)
void _lengthFromPhi(float shRhoOver2SQ, float w, float phi, out float len) {

    float shRhoOver2 = sqrt(shRhoOver2SQ);
    float chRhoOver2 = sqrt(1. + shRhoOver2SQ);

    float tanPhi = tan(phi);
    float tanPhiSQ = pow(tanPhi, 2.);

    float omega;
    float omega2;


    if (abs(tanPhi) < shRhoOver2) {
        // hyperbolic type geodesic
        // omega = sqrt(a^2 - c^2)
        omega2 = (shRhoOver2SQ - tanPhiSQ) / ((2.* shRhoOver2SQ +1.) * tanPhiSQ + shRhoOver2SQ);
        omega = sqrt(omega2);

        len = (2. / omega) * atanh(sqrt(shRhoOver2SQ - tanPhiSQ) / chRhoOver2);

    }
    else if (abs(tanPhi) == shRhoOver2) {
        // parabolic type geodesic
        len = 2. * sqrt2 * shRhoOver2;
    }
    else {
        // elliptic type geodesic
        // omega = sqrt(c^2 - a^2)
        omega2 = (tanPhiSQ - shRhoOver2SQ) / ((2.* shRhoOver2SQ +1.) * tanPhiSQ + shRhoOver2SQ);
        omega = sqrt(omega2);
        float eps = sign(tanPhi);
        float m = floor(0.5 - phi / PI);

        len = (2. / omega) *  (atan(-eps * sqrt(tanPhiSQ - shRhoOver2SQ) / chRhoOver2) + m * PI);
    }

}

// assume that a geodesic starting from the origin reach the point q
// after describing an angle phi (in the hyperbolic plane)
// return the unit tangent vector of this geodesic and its length
// we assume that rho > 0, w > 0 and phi < 0
// CHECKED (with SageMath)
void _dirLengthFromPhi(float shRhoOver2SQ, float theta, float w, float phi, out Vector tv, out float len) {

    float shRhoOver2 = sqrt(shRhoOver2SQ);
    float chRhoOver2 = sqrt(1. + shRhoOver2SQ);

    float tanPhi = tan(phi);
    float tanPhiSQ = pow(tanPhi, 2.);

    float omega;
    float omega2;
    float a;
    float c;

    if (abs(tanPhi) < shRhoOver2) {
        // hyperbolic type geodesic
        // omega = sqrt(a^2 - c^2)
        omega2 = (shRhoOver2SQ - tanPhiSQ) / ((2.* shRhoOver2SQ +1.) * tanPhiSQ + shRhoOver2SQ);
        omega = sqrt(omega2);

        a = sqrt(0.5 * (1. + omega2));
        c = sqrt(0.5 * (1. - omega2));
        len = (2. / omega) * atanh(sqrt(shRhoOver2SQ - tanPhiSQ) / chRhoOver2);

    }
    else if (abs(tanPhi) == shRhoOver2) {
        // parabolic type geodesic
        a = 1. / sqrt2;
        c = 1. / sqrt2;
        len = 2. * sqrt2 * shRhoOver2;
    }
    else {
        // elliptic type geodesic
        // omega = sqrt(c^2 - a^2)
        omega2 = (tanPhiSQ - shRhoOver2SQ) / ((2.* shRhoOver2SQ +1.) * tanPhiSQ + shRhoOver2SQ);
        omega = sqrt(omega2);
        float eps = sign(tanPhi);
        float m = floor(0.5 - phi / PI);

        a = sqrt(0.5 * (1. - omega2));
        c = sqrt(0.5 * (1. + omega2));
        len = (2. / omega) *  (atan(-eps * sqrt(tanPhiSQ - shRhoOver2SQ) / chRhoOver2) + m * PI);
    }
    float alpha = theta + c * len - 0.5 * w;
    tv = Vector(ORIGIN, vec3(a * cos(alpha), a * sin(alpha), c));
}

const int MAX_NEWTON_INIT_ITERATION = 100;
const int MAX_NEWTON_ITERATION = 100;
const float NEWTON_INIT_TOLERANCE = 0.0001;
const float NEWTON_TOLERANCE = 0.000001;

// return a value of phi between phimin and phimax such that `_height`
// (seen as a function of phi) is positive
// this value will serve as starting point for the newtown method
// the output is found using a binary search
// we assume that _height is defined and monotone on the whole interval (phimin, phimax)
// the boolean `increasing` says if it is increasing or decreasing
// CHECKED
float _height_newton_init(float shRhoOver2SQ, float w0, float phiMin, float phiMax, bool increasing) {
    float auxMin = phiMin;
    float auxMax = phiMax;
    float aux, val;
    for (int i=0; i < MAX_NEWTON_INIT_ITERATION; i++){
        aux = 0.5 * auxMin + 0.5 * auxMax;
        val = _height(shRhoOver2SQ, w0, aux);
        if (val >= 0.) {
            break;
        }
        else {
            if (increasing) {
                auxMin = aux;
            }
            else {
                auxMax = aux;
            }
        }
    }
    return aux;
}

// runs the newton algorithm to find the zero of `_height`
// starting from phi0
// CHECKED
float _height_newton(float shRhoOver2SQ, float w0, float phi0) {
    float phi = phi0;
    float tmp;
    float val;
    for (int i=0; i < MAX_NEWTON_ITERATION; i++){
        // value of _height at phi
        val = _height(shRhoOver2SQ, w0, phi);
        // backup of the previous value of phi
        tmp = phi;
        // new value of phi
        phi = phi - val/_dheight(shRhoOver2SQ, w0, phi);
        if (abs(phi - tmp) < NEWTON_TOLERANCE) {
            break;
        }
    }
    return phi;
}

// return the first zero of `_height` (seen as a function of phi)
// - use the Newton method
// - the starting point of the Newton method is obtained via a binary search
// the solution belongs to (atan(sh(rho/2) - pi, 0)
// CHECKED
float zero_height(float shRhoOver2SQ, float w0) {
    float shRhoOver2 = sqrt(shRhoOver2SQ);
    float phiMin = atan(shRhoOver2) - PI;
    float phiMax = 0.;
    float phi0 = _height_newton_init(shRhoOver2SQ, w0, phiMin, phiMax, false);
    return _height_newton(shRhoOver2SQ, w0, phi0);
}


float _exactDistToOrign(Point p) {
    Point paux;
    if (p.fiber < 0.) {
        paux = flip(p);
    }
    else {
        paux = p;
    }
    float w = paux.fiber;
    float shRhoOver2SQ = pow(paux.proj.z, 2.) + pow(paux.proj.w, 2.);
    if (shRhoOver2SQ == 0.){
        // points on the fiber axis
        if (w < 2. * PI) {
            return w;
        }
        else if (w < 2.* PI + 0.1) {
            // hack to avoid numerical erros aroud 2 * PI
            // (see the difference in the next formula)
            // use an asymptotic expansion around 2 * PI of the next formula
            float res = w;
            res = res - pow(w - 2. * PI, 2.) / (8. * PI);
            res = res + pow(w - 2. * PI, 3.) / (16. * PI * PI);
            return res;
        }
        else {
            return 2. *  PI * sqrt(0.5 * pow(w / (2. * PI) + 1., 2.) - 1.);
        }
    }
    else {
        // generic point
        float phi = zero_height(shRhoOver2SQ, w);
        float length;
        _lengthFromPhi(shRhoOver2SQ, w, phi, length);
        return length;
    }
}


// distance between two points
float exactDist(Point p1, Point p2){
    Isometry isom = makeInvLeftTranslation(p1);
    return _exactDistToOrign(translate(isom, p2));
}

// overload of the previous function in case we work with tangent vectors
float exactDist(Vector v1, Vector v2){
    return exactDist(v1.pos, v2.pos);
}

void tangDirection(Point p, Point q, out Vector tv, out float len){
    // return the unit tangent to geodesic connecting p to q.
    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).
    Vector resOrigin;
    // isometry moving back p to the origin
    Isometry shift = makeInvLeftTranslation(p);
    // translation of q at the origin
    Point qAtOrigin = translate(shift, q);

    if (FAKE_LIGHT) {
        vec4 aux = toVec4(qAtOrigin);
        resOrigin = Vector(ORIGIN, aux.xyw);
        resOrigin = tangNormalize(resOrigin);
        len = _fakeDistToOrigin(qAtOrigin);
    }
    else {
        bool flipped = false;
        // if needed we flip the point qOrigin so that its z-coordinates is positive.
        if (qAtOrigin.fiber < 0.) {
            flipped = true;
            qAtOrigin = flip(qAtOrigin);
        }

        float shRhoOver2SQ = pow(qAtOrigin.proj.z, 2.) + pow(qAtOrigin.proj.w, 2.);
        float w = qAtOrigin.fiber;

        if (shRhoOver2SQ == 0.){
            if (w < 2. * PI){
                resOrigin = Vector(ORIGIN,vec3(0, 0, 1));
                len = w;
            }
            else {
                resOrigin = Vector(ORIGIN, vec3(
                sqrt((pow(w + 2. * PI,2.) - pow(4.* PI, 2.)) / (2. * pow(w + 2. * PI, 2.) - pow(4.* PI,2.))),
                0,
                (w + 2. * PI) / sqrt(2. * pow(w + 2. * PI, 2.) - pow(4.* PI,2.))
                ));
                len = 2. *  PI * sqrt(0.5 * pow(w / (2. * PI) + 1., 2.) - 1.);
            }
        }
        else {
            vec3 aux = SLtoH2(qAtOrigin.proj);
            float theta = atan(aux.y, aux.x);
            float phi = zero_height(shRhoOver2SQ, w);
            _dirLengthFromPhi(shRhoOver2SQ, theta, w, phi, resOrigin, len);
        }

        if (flipped) {
            resOrigin = flip(resOrigin);
        }

    }

    // move back to p
    tv =  Vector(p, resOrigin.dir);
}

void tangDirection(Vector u, Vector v, out Vector tv, out float len){
    // overload of the previous function in case we work with tangent vectors
    tangDirection(u.pos, v.pos, tv, len);
}



// flow the given vector during time t using exact formulas
// this method is to be called  by `flow`
// we make the following assumtions
// - the initial position of v is the origin
// - the local direction of v is set up
// - the initial direction has the local form (a, 0, c), with a,c > 0
Vector _exactFlow(Vector v, float t) {
    Vector res;

    float a = v.dir.x;
    float c = v.dir.z;

    float w = 2. * c * t;// the angle in the fiber achieved by the geodesic (before final adjustment)
    float kappaSq = 0.;
    float kappa = 0.;// the "pulsatance" involved in the geodesic flow.
    float phi = 0.;// the rotation angle in H^2.


    // the solution has an easy description as a product of 2 x 2 matrices.
    // it is a product of isom * spin where
    // - isom is a one-parameter subgroup of SL(2,R) (elliptic, parabolic, or hyperbolic)
    // - spin is a one-parameter subgroup of SL(2,R) fixing the origin of H^2.
    // we use this form, and then convert it into a vec4

    // the spin part is always the same.
    mat2 spin = mat2(
    cos(c * t), -sin(c * t),
    sin(c * t), cos(c * t)
    );
    // to get the fiber angle we will go through the projection of the point in H^2
    // (see Jupyter Notebook)

    // we distinguish three cases, depending whether c is smaller, equal or greater than a.
    // it corresponds to the three cases for isom (elliptic, parabolic, or hyperbolic).


    // little hack to see the junction between elliptic/hyperbolic behavior
    /*
    if (abs(c-a) < 0.002) {
        hitWhich = 5;
        debugColor = vec3(1, 1, 0);
    }
    */


    /*
    if (abs(c-a)*t < 0.05) {
        // "parabolic" trajectory
        // we use an asymptotic expansion of the solution around the critical case (c = a) to reduce the noise.
        float a2 = a * a;
        float kappa2 = a * a - c * c;
        float kappa4 = kappa2 * kappa2;
        float kappa6 = kappa4 * kappa2;
        float kappa8 = kappa6 * kappa2;
        float t2 = t * t;
        float t3 = t2 * t;
        float t4 = t3 * t;
        float t5 = t4 * t;
        float t6 = t5 * t;
        float t7 = t6 * t;
        float t8 = t7 * t;

        mat2 even = mat2(1);
        mat2 odd = mat2(0, a + c, a - c, 0);
        mat2 isom = even;
        isom = isom + t * (1. / 2.) * odd;
        isom = isom + (1./2.) * t2 * (1. / 4.) * kappa2 * even;
        isom = isom + (1./6.) * t3 * (1. / 8.) * kappa2 * odd;
        isom = isom + (1./24.) * t4 * (1. / 16.) * kappa4 * even;
        isom = isom + (1./120.) * t5 * (1. / 32.) * kappa4 * odd;
        isom = isom + (1./720.) * t6 * (1. / 64.) * kappa6 * even;
        isom = isom + (1./5040.) * t7 * (1. / 128.) * kappa6 * odd;
        isom = isom + (1./40320.) * t8 * (1. / 256.) * kappa8 * even;

        res.pos.proj = SLfromMatrix2(isom * spin);

        float tanPhi = - a * c * t / 2. - a * c * kappa2 * t3 / 24. - a * c * kappa4 * t5 / 720. - a * c * kappa6 * t7 / 40320.;
        tanPhi = tanPhi /(a + a * t2 * kappa2 / 6. + a * t4 * kappa4 / 120. + a * t6 * kappa6 /5040.);
        res.pos.fiber = w + atan(tanPhi);
     }
     */
    if (abs(c-a) == 0.) {
        // parabolic trajectory
        mat2 isom = mat2(
        1, t/sqrt2,
        0, 1
        );
        res.pos.proj = SLfromMatrix2(isom * spin);

        float tanPhi = - t / (2. * sqrt2);
        res.pos.fiber = w + 2. * atan(tanPhi);

    }
    else if (c < a){
        // hyperbolic trajectory
        kappaSq = a * a - c * c;
        kappa = sqrt(kappaSq);

        mat2 isom = mat2(
        cosh(0.5 * kappa * t), kappa * sinh(0.5 * kappa * t) / (a-c),
        kappa * sinh(0.5 * kappa * t) / (a+c), cosh(0.5 * kappa * t)
        );
        res.pos.proj = SLfromMatrix2(isom * spin);

        float tanPhi = - c / kappa * tanh(0.5 * kappa * t);
        res.pos.fiber = w + 2. * atan(tanPhi);

    }
    else {
        // remaining case c > a
        // elliptic trajectory

        kappaSq = c * c - a * a;
        kappa = sqrt(kappaSq);

        mat2 isom = mat2(
        cos(0.5 * kappa * t), -kappa * sin(0.5 * kappa * t) / (a-c),
        -kappa * sin(0.5 * kappa * t) / (a+c), cos(0.5 * kappa * t)
        );
        res.pos.proj = SLfromMatrix2(isom * spin);

        float aux = floor(0.5 * kappa * t / PI + 0.5);
        float tanPhi = - c / kappa * tan(0.5 * kappa * t);
        res.pos.fiber = w + 2. * atan(tanPhi) - 2. * aux * PI;

    }

    // update the direction of the tangent vector
    // recall that tangent vectors at the origin have the form (ux,uy,uw)
    // so we work with 3x3 matrics applied to local_dir
    mat3 S = mat3(
    cos(2. * c * t), -sin(2. * c * t), 0.,
    sin(2. * c * t), cos(2. * c * t), 0.,
    0., 0., 1.
    );
    res.dir = S * v.dir;
    return res;
}


// flow the given vector during time t
Vector flow(Vector v, float t) {
    // -------------------------------------------------------
    // prepation : set the vector into an easier form to flow
    // -------------------------------------------------------

    // isometry sending the origin the the position of v
    Isometry isom = makeLeftTranslation(v);
    // pull back the tangent vector a the origin (very easy in the local representation)
    Vector vAtOrigin = Vector(ORIGIN, v.dir);
    // flip if needed to get a positive fiber direction
    bool flipped = false;
    if (vAtOrigin.dir.z < 0.) {
        flipped = true;
        vAtOrigin = flip(vAtOrigin);
    }
    // rotation
    // the angle alpha is characterized as follows
    // if u is a tangent vector with the local form (a, 0, c) with a, c >= 0
    // then v is obtained from u by a rotation of angle alpha
    float alpha = atan(vAtOrigin.dir.y, vAtOrigin.dir.x);
    float c = vAtOrigin.dir.z;
    float a = sqrt(1. - c * c);
    vAtOrigin.dir = vec3(a, 0., c);

    // -------------------------------------------------------
    // flow the vector
    // -------------------------------------------------------
    Vector resAtOrigin = _exactFlow(vAtOrigin, t);

    // -------------------------------------------------------
    // reverse the preparation done at the beginning
    // -------------------------------------------------------
    resAtOrigin = rotateBy(resAtOrigin, alpha);
    if (flipped) {
        resAtOrigin = flip(resAtOrigin);
    }

    Vector res = translate(isom, resAtOrigin);
    res = tangNormalize(res);
    return res;
}

