
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
