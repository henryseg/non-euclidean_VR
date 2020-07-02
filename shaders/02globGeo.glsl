//--------------------------------------------
// GLOBAL GEOMETRY
//--------------------------------------------

/*
  Methods computing ``global'' objects
*/


//mat4 nilMatrix(vec4 p) {
//    // return the Heisenberg isometry sending the origin to p
//    // this is in COLUMN MAJOR ORDER so the things that LOOK LIKE ROWS are actually FUCKING COLUMNS!
//    return mat4(
//    1., 0., -p.y/2., 0.,
//    0., 1., p.x/2., 0.,
//    0., 0., 1., 0.,
//    p.x, p.y, p.z, 1.);
//}

//mat4 nilMatrixInv(vec4 p) {
//    // return the Heisenberg isometry sending the p to origin
//    return mat4(
//    1., 0., p.y/2., 0.,
//    0., 1., -p.x/2., 0.,
//    0., 0., 1., 0.,
//    -p.x, -p.y, -p.z, 1.);
//}

float fakeHeightSq(Point p) {
    // square of the fake height.
    // fake height : bound on the height of the ball centered at the origin passing through p
    float z = abs(p.coords.z);

    if (z < sqrt(6.)){
        return z * z;
    }
    else if (z < 4. * sqrt(3.)){
        return 12. * (pow(0.75 * z, 2. / 3.) - 1.);
    }
    else {
        return 2. * sqrt(3.) * z;
    }
}

float fakeDistance(Point p, Point q){
    // measure the distance between two points in the geometry
    // fake distance
    // todo: check the formula if z < 0. Is a flip needed ?

    Isometry shift = makeInvLeftTranslation(p);
    Point qOrigin = translate(shift, q);
    // we now need the distance between the origin and p
    float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
    float hsq = fakeHeightSq(qOrigin);

    return pow(0.2 * pow(rhosq, 2.) + 0.8 * pow(hsq, 2.), 0.25);
}

float fakeDistance(Vector u, Vector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}

float ellipsoidDistance(Point p, Point q){
    // measure the distance between two points in the geometry
    // fake distance

    Isometry shift = makeInvLeftTranslation(p);
    Point qOrigin = translate(shift, q);
    // we now need the distance between the origin and p
    float rhosq = pow(qOrigin.coords.x, 2.)+pow(qOrigin.coords.y, 2.);
    float hsq = fakeHeightSq(qOrigin);

    return pow(1. * pow(rhosq, 10.) + 1. * pow(hsq, 2.), 0.25);
}

float ellipsoidDistance(Vector u, Vector v){
    // overload of the previous function in case we work with tangent vectors
    return ellipsoidDistance(u.pos, v.pos);
}


// assume that a geodesic starting from the origin reach the point q
// after describing an angle phi (in the xy plane)
// return the length of this geodesic
// the point q is given in cylinder coordiantes (rho, theta, z)
// we assume that rho != 0 and z != 0
// todo. check the formulas when z < 0
void _lengthFromPhi(float rhosq, float z, float phi, out float len) {
    float sign = 0.;
    if (z > 0.) {
        sign = 1.;
    }
    else {
        sign = -1.;
    }
    float c = sign * 2. * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.));
    len = phi / c;
}

// assume that a geodesic starting from the origin reach the point q
// after describing an angle phi (in the xy plane)
// return the unit tangent vector of this geodesic and its length
// the point q is given in cylinder coordiantes (rho, theta, z)
// we assume that rho != 0 and z != 0
// todo. check the formulas when z < 0
void _dirLengthFromPhi(float rhosq, float theta, float z, float phi, out Vector tv, out float len) {
    float sign = 0.0;
    if (z > 0.0) {
        sign = 1.0;
    }
    else {
        sign = -1.0;
    }
    float c = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
    float a = sqrt(1.0  - pow(c, 2.0));
    float alpha = - 0.5 * phi + theta;
    tv = Vector(
    ORIGIN,
    vec4(a * cos(alpha), a * sin(alpha), c, 0.0)
    );
    len = phi / c;
}

float exactDist(Point p, Point q) {
    // move p to the origin and q accordingly
    Isometry shift = makeInvLeftTranslation(p);
    Point qOrigin = translate(shift, q);

    float z = qOrigin.coords.z;
    float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);

    if (z == 0.) {
        // qOrigin on the xy-plane
        return sqrt(rhosq);
    }
    else if (rhosq == 0.){
        // qOrigin on the z-axis
        float k = floor(0.5 * abs(z) / PI);
        return 2. * PI * sqrt((abs(z) / PI - k) * k);
    }
    else {
        // generic position for qOrigin
        float phi = zero_height(rhosq, abs(z));
        float length;
        _lengthFromPhi(rhosq, abs(z), phi, length);
        return length;
    }
}

float exactDist(Vector u, Vector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}


void tangDirection(Point p, Point q, out Vector tv, out float len){
    // return the unit tangent to geodesic connecting p to q.
    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).
    Vector resOrigin;

    if (FAKE_LIGHT) {
        // if FAKE_LIGHT is ON, just return the Euclidean vector pointing to q
        len = length(q.coords - p.coords);
        resOrigin = Vector(ORIGIN, (q.coords-p.coords) / len);
    }
    else {
        // move p to the origin and q accordingly
        Isometry shift = makeInvLeftTranslation(p);
        Point qOrigin = translate(shift, q);

        // solve the problem !
        float z = qOrigin.coords.z;

        if (z == 0.0) {
            // qOrigin on the xy-plane
            resOrigin =  Vector(
            ORIGIN,
            vec4(qOrigin.coords.x, qOrigin.coords.y, 0, 0)
            );
            len = length(qOrigin.coords);
            resOrigin = tangNormalize(resOrigin);
        }
        else {
            float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
            if (rhosq == 0.) {
                // qOrigin on the z-axis
                // not the shortest geodesic for the moment
                float sign = 0.;
                if (z > 0.) {
                    sign = 1.;
                }
                else {
                    sign = -1.;
                }
                resOrigin = Vector(
                ORIGIN,
                vec4(0, 0, sign, 0)
                );
                len = abs(z);
            }
            else {
                float theta = atan(qOrigin.coords.y, qOrigin.coords.x);
                float phi = zero_height(rhosq, abs(z));
                _dirLengthFromPhi(rhosq, theta, z, phi, resOrigin, len);
            }
        }
    }
    // move back to p
    tv =  Vector(p, resOrigin.dir);
}


//Vector tangDirection(vec4 p, vec4 q){
//    // return the unit tangent to geodesic connecting p to q.
//    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).
//
//    if (FAKE_LIGHT) {
//        // if FAKE_LIGHT is ON, just return the Euclidean vector pointing to q
//        return Vector(p, normalize(q-p));
//    }
//
//    else {
//        // move p to the origin
//        mat4 isom = nilMatrix(p);
//        mat4 isomInv = nilMatrixInv(p);
//
//        vec4 qOrigin = isomInv*q;
//
//        // solve the problem !
//        float z = qOrigin.z;
//
//        vec4 resOrigin;
//        if (z == 0.0) {
//            // probably not needed (case contained in the next one)
//            resOrigin =  vec4(qOrigin.z, qOrigin.y, qOrigin.z, 0.0);
//        }
//        else {
//
//
//            float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
//            float theta = atan(qOrigin.y, qOrigin.x);
//            float phi = zero_height(rhosq, abs(z));
//
//            resOrigin = _dirFromPhi(rhosq, theta, z, phi);
//        }
//
//
//        // move back to p
//        return Vector(p, isom * resOrigin);
//
//        /*
//        // solve the problem !
//        float x3 = qOrigin.z;
//
//        vec4 resOrigin = vec4(0.);
//        if (x3 == 0.0) {
//            // probably not needed (case contained in the next one)
//            resOrigin =  vec4(qOrigin.z, qOrigin.y, qOrigin.z, 0.0);
//        }
//        else {
//            float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
//            float phi = newton_zero(rhosq, x3);
//            float sign = 0.0;
//            if (x3 > 0.0) {
//                sign = 1.0;
//            }
//            else {
//                sign = -1.0;
//            }
//            float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
//            float c = sqrt(1.0  - pow(w, 2.0));
//            float alpha = - 0.5 * phi;
//            if (qOrigin.x*qOrigin.y != 0.0){
//                alpha = alpha + atan(qOrigin.y, qOrigin.x);
//            }
//            //float t = phi / w;
//
//            //resOrigin =  t * vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
//            resOrigin =  vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
//        }
//
//        // move back to p
//        return Vector(p, isom * resOrigin);
//        */
//    }
//}


void tangDirection(Vector u, Vector v, out Vector tv, out float len){
    // overload of the previous function in case we work with tangent vectors
    tangDirection(u.pos, v.pos, tv, len);
}

// return the unit tangent to second and thrid geodesic (by order of length) connecting p to q.
// if such vectors exists returns true and populate `directions`
// otherwise returns false
bool tangDirectionBis(Point p, Point q, out Vector[2] dirs, out float[2] lens) {
    Vector resOrigin;

    // move p to the origin and q accordingly
    Isometry shift = makeInvLeftTranslation(p);
    Point qOrigin = translate(shift, q);

    // solve the problem !
    float z = qOrigin.coords.z;

    if (z == 0.) {
        return false;
    }
    else {
        float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
        float theta = atan(qOrigin.coords.y, qOrigin.coords.x);
        float[2] phis;
        bool check = zerobis_height(rhosq, abs(z), phis);
        if (check) {
            Vector resOrigin0, resOrigin1;
            float len0, len1;
            _dirLengthFromPhi(rhosq, theta, z, phis[0], resOrigin0, len0);
            _dirLengthFromPhi(rhosq, theta, z, phis[1], resOrigin1, len1);

            // move back to p
            dirs[0] = Vector(p, resOrigin0.dir);
            dirs[1] = Vector(p, resOrigin1.dir);
            lens[0] = len0;
            lens[1] = len1;
        }
        return check;
    }
}



Vector flow(Vector tv, float t){
    // Follow the geodesic flow during a time t
    // If the tangent vector at the origin is too close to the XY plane,
    // we use an asymptotic expansion of the geodesics.
    // This help to get rid of the noise around the XY plane
    // The threshold is given by the tolerance parameter
    float tolerance = 0.1;


    // move p to the origin
    Isometry shift = makeLeftTranslation(tv.pos);

    // vector at the origin
    Vector tvOrigin = Vector(ORIGIN, tv.dir);

    // solve the problem !
    float c = tvOrigin.dir.z;
    float a = sqrt(1. - c * c);
    // float alpha = fixedatan(tvOrigin.dir.y, tvOrigin.dir.x);
    float theta = atan(tvOrigin.dir.y, tvOrigin.dir.x);


    Vector achievedFromOrigin;


    if (abs(c * t) < tolerance){
        // use an asymptotic expansion (computed with SageMath)

        // factorize some computations...
        float cosa = cos(theta);
        float sina = sin(theta);
        float t1 = t;
        float t2 = t1 * t;
        float t3 = t2 * t;
        float t4 = t3 * t;
        float t5 = t4 * t;
        float t6 = t5 * t;
        float t7 = t6 * t;
        float t8 = t7 * t;
        float t9 = t8 * t;

        float w1 = c;
        float w2 = w1 * c;
        float w3 = w2 * c;
        float w4 = w3 * c;
        float w5 = w4 * c;
        float w6 = w5 * c;
        float w7 = w6 * c;



        achievedFromOrigin.pos = Point(vec4(
        a * t1 * cosa
        - (1. / 2.) * a * t2 * w1 * sina
        - (1. / 6.) * a * t3 * w2 * cosa
        + (1. / 24.) * a * t4 * w3 * sina
        + (1. / 120.) * a * t5 * w4 * cosa
        - (1. / 720.) * a * t6 * w5 * sina
        - (1. / 5040.) * a * t7 * w6 * cosa
        + (1. / 40320.) * a * t8 * w7 * sina,

        a * t * sina
        + (1. / 2.) * a * t2 * w1 * cosa
        - (1. / 6.) * a * t3 * w2 * sina
        - (1. / 24.) * a * t4 * w3 * cosa
        + (1. / 120.) * a * t5 * w4 * sina
        + (1. / 720.) * a * t6 * w5 * cosa
        - (1. / 5040.) * a * t7 * w6 * sina
        - (1. / 40320.) * a * t8 * w7 * cosa,

        (1. / 12.) * (a * a * t3 + 12. * t1) * w1
        - (1. / 240.) * a * a * t5 * w3
        + (1. / 10080.) * a * a * t7 * w5
        - (1. / 725760.) * a * a * t9 * w7,

        1));
    }

    /*
        For the record, the previous test without the asymptotic expansion

        if (c == 0.) {

            achievedFromOrigin.pos = Point(vec4(a * cos(theta) * t, a * sin(theta) * t, 0. , 1.));
            //achievedFromOrigin.dir = tvOrigin.dir;
    }
    */

    else {
        achievedFromOrigin.pos = Point(vec4(
        2. * (a / c) * sin(0.5 * c * t) * cos(0.5 * c * t + theta),
        2. * (a / c) * sin(0.5 * c * t) * sin(0.5 * c * t + theta),
        c * t + 0.5 * pow(a / c, 2.) * (c * t - sin(c * t)),
        1.
        ));
    }

    // there is case distinction for the direction (pulled back at the origin)
    achievedFromOrigin.dir = vec4(a * cos(c * t + theta), a * sin(c * t + theta), c, 0.);

    // move back to p
    return translate(shift, achievedFromOrigin);
}


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------


//Project onto the Klein Model
vec4 modelProject(Point p){
    return p.coords;
}


//--------------------------------------------
//Geometry of Space
//--------------------------------------------

//project point back onto the geometry
Point geomNormalize(vec4 u){
    return Point(u);
}


//-------------------------------------------------------
// LIGHT
//-------------------------------------------------------
//light intensity as a fn of distance
float lightAtt(float dist){
    //fake linear falloff
    return dist;

}
