//--------------------------------------------
// GLOBAL GEOMETRY
//--------------------------------------------

/*
  Methods computing ``global'' objects
*/

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
    float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
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
// we assume that rho > 0 and z > 0
void _lengthFromPhi(float rhoSq, float z, float phi, out float len) {
    float c = 2. * sin(0.5 * phi) / sqrt(rhoSq + 4.0 * pow(sin(0.5 * phi), 2.));
    len = abs(phi / c);
}

// assume that a geodesic starting from the origin reach the point q
// after describing an angle phi (in the xy plane)
// return the unit tangent vector of this geodesic and its length
// the point q is given in cylinder coordiantes (rho, theta, z)
// we assume that rho > 0 and z > 0
void _dirLengthFromPhi(float rhoSq, float theta, float z, float phi, out Vector dir, out float len) {
    float a = sqrt(rhoSq) / sqrt(rhoSq + 4. * pow(sin(0.5 * phi), 2.));
    float c = 2. * abs(sin(0.5 * phi)) / sqrt(rhoSq + 4. * pow(sin(0.5 * phi), 2.));
    float alpha = - 0.5 * phi + theta;
    if (sin(0.5 * phi) <  0.) {
        alpha = alpha + PI;
    }
    dir = Vector(ORIGIN, vec4(a * cos(alpha), a * sin(alpha), c, 0.));
    dir = tangNormalize(dir);
    len = phi / c;
}


// Compute the exact distance between p and q
float exactDist(Point p, Point q) {
    // move p to the origin and q accordingly
    Isometry shift = makeInvLeftTranslation(p);
    Point qOrigin = translate(shift, q);

    // if needed we flip the point qOrigin so that its z-coordinates is positive.
    // this does not change its distance to the origin
    if (qOrigin.coords.z < 0.){
        qOrigin = translate(flip, qOrigin);
    }
    float z = qOrigin.coords.z;
    float rhoSq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);

    if (z == 0.) {
        // qOrigin on the xy-plane
        return sqrt(rhoSq);
    }
    else if (rhoSq == 0.){
        // qOrigin on the z-axis
        if (z < 2. * PI) {
            return z;
        }
        else {
            return 2. * PI * sqrt(z / PI - 1.);
        }
    }
    else {
        // generic position for qOrigin
        float phi = zero_height(rhoSq, z);
        float length;
        _lengthFromPhi(rhoSq, z, phi, length);
        return length;
    }
}

float exactDist(Vector u, Vector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}


// fake direction from p to q
// just return the Euclidean vector pointing to q
// maxDir is a integer between 1 and MAX_DIRS_LIGHT
// we return at most maxDir directions
int _fakeDirections(Point p, Point q, int maxDir, out Vector[MAX_DIRS_LIGHT] dirs, out float[MAX_DIRS_LIGHT] lens){
    Isometry shift = makeInvLeftTranslation(p);
    vec4 dirOrigin = q.coords - p.coords;
    Vector resOrigin = Vector(ORIGIN, shift.mat * dirOrigin);
    resOrigin = tangNormalize(resOrigin);
    // move back to p
    dirs[0] =  Vector(p, resOrigin.dir);
    lens[0] = fakeDistance(p, q);
    return 1;
}

// direction from the origin to a point q on the xy-plane, that z = 0
// maxDir is a integer between 1 and MAX_DIRS_LIGHT
// we return at most maxDir directions
int _dirFromOriginPlane(Point q, int maxDir, out Vector[MAX_DIRS_LIGHT] dirs, out float[MAX_DIRS_LIGHT] lens){
    Vector dir = Vector(ORIGIN, vec4(q.coords.x, q.coords.y, 0, 0));
    dirs[0] = tangNormalize(dir);
    lens[0] = length(q.coords);
    return 1;
}

// direction from the origin to a point q on the fiber axis, that is x = y = 0.
// we also assume that z > 0
// for each rotation invariant family of geodesic, we return only one of them
// maxDir is a integer between 1 and MAX_DIRS_LIGHT
// we return at most maxDir directions
int _dirFromOriginFiber(Point q, int maxDir, out Vector[MAX_DIRS_LIGHT] dirs, out float[MAX_DIRS_LIGHT] lens){
    float z = q.coords.z;
    if (z < 2. * PI){
        dirs[0] = Vector(ORIGIN, vec4(0, 0, 1, 0));
        lens[0] = z;
        return 1;
    }
    else {
        float n = floor(0.5 * z /PI);
        int nInt = int(n);
        int count = 0;
        for (int k = 1; k <= maxDir; k++) {
            float kFloat = float(k);
            if (k <= nInt) {
                dirs[k-1] = Vector(ORIGIN, vec4(
                sqrt((z - 2. * kFloat * PI) / (z - kFloat * PI)),
                0,
                sqrt(kFloat * PI/ (z - kFloat * PI)),
                0
                ));
                lens[k-1] = 2. * kFloat * PI * sqrt(z / (kFloat * PI) - 1.);
                count++;
            }
            else {
                dirs[k-1] = Vector(ORIGIN, vec4(0, 0, 1, 0));
                lens[k-1] = z;
                count++;
                break;
            }
        }
        return count;
    }
}

// direction from the origin to a generic point q
// maxDir is a integer between 1 and MAX_DIRS_LIGHT
// we return at most maxDir directions
// we assume that rho > 0  and z > 0
int _dirFromOriginGeneric(Point q, int maxDir, out Vector[MAX_DIRS_LIGHT] dirs, out float[MAX_DIRS_LIGHT] lens){
    float rhoSq = pow(q.coords.x, 2.) + pow(q.coords.y, 2.);
    float z = q.coords.z;
    float theta = atan(q.coords.y, q.coords.x);
    int count = 0;

    // declaring variables
    Vector dir;
    float len;
    float[2] phis;
    bool check;

    // direction of the shortest geodesic
    float phi = zero_height(rhoSq, z);
    _dirLengthFromPhi(rhoSq, theta, z, phi, dir, len);
    dirs[0] = dir;
    lens[0] = len;
    count++;

    // direction of the other geodesics
    for (int k = 1; 2 * k - 1 < maxDir; k++){
        check = zerobis_height(rhoSq, z, k, phis);
        if (!check) {
            // if there is no geodesic making at least k full turn, we stop the loop
            break;
        }
        // adding the next direction
        _dirLengthFromPhi(rhoSq, theta, z, phis[0], dir, len);
        dirs[2 * k - 1] = dir;
        lens[2 * k - 1] = len;
        count ++;
        if (count < maxDir) {
            // if there is still some place for one more direction, add it
            _dirLengthFromPhi(rhoSq, theta, z, phis[1], dir, len);
            dirs[2 * k] = dir;
            lens[2 * k] = len;
            count ++;
        }
    }
    return count;
}

// The output m is min of n, N = MAX_DIRS_LIGHT and the number of direction from p to q
// The function also populates dirs[0:m] and len[0:m] with the corresponding directions and lengths
// n <= 0 this means that n = infty
int directions(Point p, Point q, int n, out Vector[MAX_DIRS_LIGHT] dirs, out float[MAX_DIRS_LIGHT] lens){
    Vector resOrigin;
    int maxDir;
    if (n <= 0) {
        maxDir = MAX_DIRS_LIGHT;
    }
    else {
        maxDir = min(n, MAX_DIRS_LIGHT);
    }

    if (FAKE_LIGHT) {
        return _fakeDirections(p, q, maxDir, dirs, lens);
    }
    else {
        int res;
        Vector[MAX_DIRS_LIGHT] dirsOrigin;

        // move p to the origin and q accordingly
        Isometry shift = makeInvLeftTranslation(p);
        Point qOrigin = translate(shift, q);
        bool flipped = false;
        // if needed we flip the point qOrigin so that its z-coordinates is positive.
        if (qOrigin.coords.z < 0.) {
            flipped = true;
            qOrigin = translate(flip, qOrigin);
        }

        float rhoSq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
        float z = qOrigin.coords.z;

        if (z == 0.0) {
            // qOrigin on the xy-plane
            res = _dirFromOriginPlane(qOrigin, maxDir, dirsOrigin, lens);
        }
        else if (rhoSq == 0.) {
            // qOrigin on the z-axis
            res = _dirFromOriginFiber(qOrigin, maxDir, dirsOrigin, lens);
        }
        else {
            // qOrigin generic
            res = _dirFromOriginGeneric(qOrigin, maxDir, dirsOrigin, lens);
        }

        for (int k = 0; k < res; k++) {
            Vector aux = dirsOrigin[k];
            if (flipped) {
                aux = translate(flip, aux);
            }
            dirs[k] = Vector(p, aux.dir);
        }
        return res;
    }
}


void direction(Point p, Point q, out Vector dir, out float len){
    // return the unit tangent to shortest geodesic connecting p to q.
    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).
    Vector[MAX_DIRS_LIGHT] dirs;
    float[MAX_DIRS_LIGHT] lens;
    directions(p, q, 1, dirs, lens);
    dir = dirs[0];
    len = lens[0];
}

void direction(Vector u, Vector v, out Vector dir, out float len){
    direction(u.pos, v.pos, dir, len);
}
//
//void tangDirection(Point p, Point q, out Vector tv, out float len){
//    // return the unit tangent to geodesic connecting p to q.
//    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).
//    Vector resOrigin;
//
//    if (FAKE_LIGHT) {
//        // if FAKE_LIGHT is ON, just return the Euclidean vector pointing to q
//        len = fakeDistance(p, q);
//        Isometry shift = makeInvLeftTranslation(p);
//        vec4 dirOrigin = q.coords-p.coords;
//        resOrigin = Vector(ORIGIN, shift.mat * dirOrigin);
//        resOrigin = tangNormalize(resOrigin);
//        //debugColor = 0.5 + 0.5 * (dirOrigin / length(dirOrigin)).xyz;
//        //debugColor = 0.5 + 0.5 * resOrigin.dir.xyz;
//        //debugColor = vec3(0,0,resOrigin.dir.z);
//    }
//    else {
//        // move p to the origin and q accordingly
//        Isometry shift = makeInvLeftTranslation(p);
//        Point qOrigin = translate(shift, q);
//        bool flipped = false;
//        // if needed we flip the point qOrigin so that its z-coordinates is positive.
//        if (qOrigin.coords.z < 0.) {
//            flipped = true;
//            qOrigin = translate(flip, qOrigin);
//        }
//
//        float z = qOrigin.coords.z;
//        if (z == 0.0) {
//            // qOrigin on the xy-plane
//            resOrigin =  Vector(
//            ORIGIN,
//            vec4(qOrigin.coords.x, qOrigin.coords.y, 0, 0)
//            );
//            len = length(qOrigin.coords);
//            resOrigin = tangNormalize(resOrigin);
//        }
//        else {
//            float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
//            if (rhosq == 0.) {
//                // qOrigin on the z-axis
//                if (z < 2. * PI){
//                    resOrigin = Vector(
//                    ORIGIN,
//                    vec4(0, 0, 1, 0)
//                    );
//                    len = z;
//                }
//                else {
//                    // return only one of the directions going to the light
//                    resOrigin = Vector(ORIGIN, vec4(
//                    sqrt((z - 2. * PI) / (z - PI)),
//                    0,
//                    sqrt(PI/ (z - PI)),
//                    0));
//                    len = 2. * PI * sqrt(z / PI - 1.);
//                }
//
//            }
//            else {
//                float theta = atan(qOrigin.coords.y, qOrigin.coords.x);
//                float phi = zero_height(rhosq, z);
//                _dirLengthFromPhi(rhosq, theta, z, phi, resOrigin, len);
//            }
//        }
//
//        if (flipped) {
//            resOrigin = translate(flip, resOrigin);
//        }
//    }
//    // move back to p
//    tv =  Vector(p, resOrigin.dir);
//}
//
//
//void tangDirection(Vector u, Vector v, out Vector tv, out float len){
//    // overload of the previous function in case we work with tangent vectors
//    tangDirection(u.pos, v.pos, tv, len);
//}

//// return the unit tangent to second and third geodesic (by order of length) connecting p to q.
//// if such vectors exists returns true and populate `directions`
//// otherwise returns false
//bool tangDirectionBis(Point p, Point q, out Vector[2] dirs, out float[2] lens) {
//    Vector resOrigin0;
//    Vector resOrigin1;
//    bool check;
//
//    // move p to the origin and q accordingly
//    Isometry shift = makeInvLeftTranslation(p);
//    Point qOrigin = translate(shift, q);
//    bool flipped = false;
//    // if needed we flip the point qOrigin so that its z-coordinates is positive.
//    if (qOrigin.coords.z < 0.) {
//        flipped = true;
//        qOrigin = translate(flip, qOrigin);
//    }
//
//    float z = qOrigin.coords.z;
//    if (z == 0.) {
//        check = false;
//    }
//    else {
//        float rhosq = pow(qOrigin.coords.x, 2.) + pow(qOrigin.coords.y, 2.);
//        if (rhosq == 0.) {
//            if (z < 2. * PI) {
//                check = false;
//            }
//            else {
//                resOrigin0 = Vector(p, vec4(0, 0, 1, 0));
//                resOrigin1 = Vector(p, vec4(0, 0, 1, 0));
//                lens[0] = z;
//                lens[1] = z;
//                check =  true;
//            }
//        }
//        else {
//            float theta = atan(qOrigin.coords.y, qOrigin.coords.x);
//            float[2] phis;
//            check = zerobis_height(rhosq, z, 1, phis);
//            if (check) {
//                float len0, len1;
//                _dirLengthFromPhi(rhosq, theta, z, phis[0], resOrigin0, len0);
//                _dirLengthFromPhi(rhosq, theta, z, phis[1], resOrigin1, len1);
//                lens[0] = len0;
//                lens[1] = len1;
//
//            }
//
//        }
//    }
//    if (check && flipped) {
//        resOrigin0 = translate(flip, resOrigin0);
//        resOrigin1 = translate(flip, resOrigin1);
//    }
//    //debugColor = resOrigin0.dir.xyz;
//
//
//    // move back to p
//    dirs[0] = Vector(p, resOrigin0.dir);
//    dirs[1] = Vector(p, resOrigin1.dir);
//    return check;
//}



Vector flow(Vector v, float t){
    // Follow the geodesic flow during a time t
    // If the tangent vector at the origin is too close to the XY plane,
    // we use an asymptotic expansion of the geodesics.
    // This help to get rid of the noise around the XY plane
    // The threshold is given by the tolerance parameter
    float tolerance = 0.1;


    // move p to the origin
    Isometry shift = makeLeftTranslation(v.pos);

    // vector at the origin
    Vector vOrigin = Vector(ORIGIN, v.dir);

    // solve the problem !
    float c = vOrigin.dir.z;
    float a = sqrt(1. - c * c);
    // float alpha = fixedatan(tvOrigin.dir.y, tvOrigin.dir.x);
    float alpha = atan(vOrigin.dir.y, vOrigin.dir.x);

    Vector achievedFromOrigin;

    if (abs(c * t) < tolerance){
        // use an asymptotic expansion (computed with SageMath)

        // factorize some computations...
        float cosa = cos(alpha);
        float sina = sin(alpha);
        float t1 = t;
        float t2 = t1 * t;
        float t3 = t2 * t;
        float t4 = t3 * t;
        float t5 = t4 * t;
        float t6 = t5 * t;
        float t7 = t6 * t;
        float t8 = t7 * t;
        float t9 = t8 * t;

        float c1 = c;
        float c2 = c1 * c;
        float c3 = c2 * c;
        float c4 = c3 * c;
        float c5 = c4 * c;
        float c6 = c5 * c;
        float c7 = c6 * c;



        achievedFromOrigin.pos = Point(vec4(
        a * t1 * cosa
        - (1. / 2.) * a * t2 * c1 * sina
        - (1. / 6.) * a * t3 * c2 * cosa
        + (1. / 24.) * a * t4 * c3 * sina
        + (1. / 120.) * a * t5 * c4 * cosa
        - (1. / 720.) * a * t6 * c5 * sina
        - (1. / 5040.) * a * t7 * c6 * cosa
        + (1. / 40320.) * a * t8 * c7 * sina,

        a * t * sina
        + (1. / 2.) * a * t2 * c1 * cosa
        - (1. / 6.) * a * t3 * c2 * sina
        - (1. / 24.) * a * t4 * c3 * cosa
        + (1. / 120.) * a * t5 * c4 * sina
        + (1. / 720.) * a * t6 * c5 * cosa
        - (1. / 5040.) * a * t7 * c6 * sina
        - (1. / 40320.) * a * t8 * c7 * cosa,

        (1. / 12.) * (a * a * t3 + 12. * t1) * c1
        - (1. / 240.) * a * a * t5 * c3
        + (1. / 10080.) * a * a * t7 * c5
        - (1. / 725760.) * a * a * t9 * c7,

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
        2. * (a / c) * sin(0.5 * c * t) * cos(0.5 * c * t + alpha),
        2. * (a / c) * sin(0.5 * c * t) * sin(0.5 * c * t + alpha),
        c * t + 0.5 * pow(a / c, 2.) * (c * t - sin(c * t)),
        1.
        ));
    }

    // there is case distinction for the direction (pulled back at the origin)
    achievedFromOrigin.dir = vec4(a * cos(c * t + alpha), a * sin(c * t + alpha), c, 0.);

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
