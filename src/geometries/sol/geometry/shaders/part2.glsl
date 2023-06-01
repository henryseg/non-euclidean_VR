/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Implementation of the euclidean geometry (part 2)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Section of the frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 */
void frame(Point p, out Vector[3] f){
    f[0] = Vector(p, vec4(1, 0, 0, 0));
    f[1] = Vector(p, vec4(0, 1, 0, 0));
    f[2] = Vector(p, vec4(0, 0, 1, 0));
}

/**
 * Section of the orthonormal frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 */
void orthoFrame(Point p, out Vector[3] f){
    f[0] = Vector(p, vec4(1, 0, 0, 0));
    f[1] = Vector(p, vec4(0, 1, 0, 0));
    f[2] = Vector(p, vec4(0, 0, 1, 0));
}

/**
 * Compute (an approximation of) the point obtained from p by moving the given direction.
 * @param[in] p initial point.
 * @param[in] dp the coordinate of the direction with respect to the frame provided by frame()
 */
Point smallShift(Point p, vec3 dp){
    Point aux = Point(vec4(dp, 1));
    Isometry isom = makeTranslation(p);
    return applyIsometry(isom, aux);
}

Vector smallShift(Vector v, vec3 dp){
    Point pos = smallShift(v.pos, dp);
    return Vector(pos, v.dir);
}

/**
 * Numerical verstion of the flow
 * Euler method
 * The vector v is assume to be a **unit** vector  
 */
Vector numFlow(Vector v, float t){
    float NUM_STEP = 0.0002;
    Isometry shift = makeTranslation(v.pos);

    Vector aux = Vector(ORIGIN, v.dir);
    vec4 field_p;
    vec4 field_u;
    int n = int(floor(t/NUM_STEP));
    for (int i=0; i<n; i++){
        field_p = vec4(
        exp(aux.pos.coords.z) * aux.dir.x,
        exp(-aux.pos.coords.z) * aux.dir.y,
        aux.dir.z,
        0.
        );
        field_u = vec4(
        aux.dir.x * aux.dir.z,
        -aux.dir.y * aux.dir.z,
        - aux.dir.x *  aux.dir.x + aux.dir.y * aux.dir.y,
        0
        );
        aux.pos.coords = aux.pos.coords + NUM_STEP * field_p;
        aux.dir = aux.dir + NUM_STEP * field_u;
        aux = geomNormalize(aux);
    }
    return applyIsometry(shift, aux);
}

Vector hypXFlow(Vector v, float t){
    // flow in (the neighborhood of) the hyperbolic sheets {x = 0}
    // use an taylor expansion at the order 2 around a = 0
    // if need one could use a higher order expansion...
    // one "just" need to do a few ugly computations before!
    
    // Isometry moving back to the origin and conversely
    Isometry shift = makeTranslation(v.pos);
    // result to be populated
    Vector resOrigin;

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = v.dir.x;
    float b = v.dir.y;
    float c = v.dir.z;

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

    resOrigin.pos.coords = p0 + a * p1 + a * a * p2;
    
    resOrigin = geomNormalize(resOrigin);
    return applyIsometry(shift, resOrigin);
}

Vector hypYFlow(Vector v, float t) {
    // flow in (the neighborhood of) the hyperbolic sheets {y = 0}
    // instead of copy/paste the formula, use the flip
    Vector res = flip(v);
    res = hypXFlow(res, t);
    res = flip(res);
    return res;
}


Vector ellFlow(Vector v, float t){
    // follow the geodesic flow during a time t
    // generic case

    // Isometry moving back to the origin and conversely
    Isometry shift = makeTranslation(v.pos);

    // result to be populated
    Vector resOrigin;

    // renaming the coordinates of the tangent vector to simplify the formulas
    float a = v.dir.x;
    float b = v.dir.y;
    float c = v.dir.z;
    
    // In order to minimizes the computations we adopt the following trick
    // For long steps, i.e. if mu * t > 4K, then we only march by an integer multiple of the period 4K.
    // In this way, there is no elliptic function to compute : only the x,y coordinates are shifted by a translation
    // We only compute elliptic functions for small steps, i.e. if mu * t < 4K

 //   float steps = floor((ell_mu * t) / (4. * ell_K));

//    if (steps > 0.5) {
//        resOrigin.pos = vec4(ell_L * steps * 4. * ell_K, ell_L * steps * 4. * ell_K, 0., 1.);
//        resOrigin.dir = vec4(a, b, c, 0.);
//    }
//    else {

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
        resOrigin.pos.coords = vec4(

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
//    }

    resOrigin = geomNormalize(resOrigin);
    return applyIsometry(shift, resOrigin);
}


/**
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){
    float tolerance = 0.0001;

    if (abs(t) < 0.002) {
        return numFlow(v, t);
        //return ellflow(tv, t);
    }
    else {
        if (abs(v.dir.x * t) < tolerance) {
            //if (tv.dir.x ==0.) {
            return hypXFlow(v, t);
        }
        else if (abs(v.dir.y * t) < tolerance) {
            //else if (tv.dir.y ==0.) {
            return hypYFlow(v, t);
        }
        else {
            return ellFlow(v, t);
//            return numFlow(v, t);
        }
    }
}
