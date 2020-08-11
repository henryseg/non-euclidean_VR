//--------------------------------------------
// GLOBAL GEOMETRY
//--------------------------------------------

/*
  Methods computing ``global'' objects
*/


mat4 nilMatrix(vec4 p) {
    // return the Heisenberg isometry sending the origin to p
    // this is in COLUMN MAJOR ORDER so the things that LOOK LIKE ROWS are actually FUCKING COLUMNS!
    return mat4(
    1., 0., -p.y/2., 0.,
    0., 1., p.x/2., 0.,
    0., 0., 1., 0.,
    p.x, p.y, p.z, 1.);
}

mat4 nilMatrixInv(vec4 p) {
    // return the Heisenberg isometry sending the p to origin
    return mat4(
    1., 0., p.y/2., 0.,
    0., 1., -p.x/2., 0.,
    0., 0., 1., 0.,
    -p.x, -p.y, -p.z, 1.);
}

float fakeHeightSq(float z) {
    // square of the fake height.
    // fake height : bound on the height of the ball centered at the origin passing through p
    // (whose z coordinate is the argument)

    if (z < sqrt(6.)){
        return z * z;
    }
    else if (z < 4.*sqrt(3.)){
        return 12. * (pow(0.75 * z, 2. / 3.) - 1.);
    }
    else {
        return 2. * sqrt(3.) * z;
    }
}


float fakeDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv*q;
    // we now need the distance between the origin and p
    float rhosq = pow(qOrigin.x, 2.)+pow(qOrigin.y, 2.);
    float hsq = fakeHeightSq(qOrigin.z);

    return pow(0.2*pow(rhosq, 2.) + 0.8*pow(hsq, 2.), 0.25);
}


float fakeDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return fakeDistance(u.pos, v.pos);
}





float ellipsoidDistance(vec4 p, vec4 q){
    // measure the distance between two points in the geometry
    // fake distance

    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv*q;
    // we now need the distance between the origin and p
    float rhosq = pow(qOrigin.x, 2.)+pow(qOrigin.y, 2.);
    float hsq = fakeHeightSq(qOrigin.z);

    return pow(1.*pow(rhosq, 10.) + 1.*pow(hsq, 2.), 0.25);
}

float ellipsoidDistance(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return ellipsoidDistance(u.pos, v.pos);
}



float exactDist(vec4 p, vec4 q) {
    // move p to the origin
    mat4 isomInv = nilMatrixInv(p);
    vec4 qOrigin = isomInv * q;

    float z = qOrigin.z;
    float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);

    if (z == 0.0) {
        return sqrt(rhosq);
    }
    else {
        float phi = zero_height(rhosq, abs(z));
        float sign = 0.0;
        if (z > 0.0) {
            sign = 1.0;
        }
        else {
            sign = -1.0;
        }
        float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
        return abs(phi/w);
    }

    /*
    // solve the problem !
    float x3 = qOrigin.z;
    float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);

    if (x3 == 0.0) {
        return sqrt(rhosq);
    }
    else {
        float phi = newton_zero(rhosq, x3);
        float sign = 0.0;
        if (x3 > 0.0) {
            sign = 1.0;
        }
        else {
            sign = -1.0;
        }
        float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
        return abs(phi/w);
    }
    */
}

float exactDist(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDist(u.pos, v.pos);
}

// assume that a geodesic starting from the origin reach the point q
// after describing an angle phi (in the xy plane)
// return the unit tangent vector of this geodesic
// the point q is given in cylinder coordiantes (rho, theta, z)
// we assume that z != 0
vec4 _dirFromPhi(float rhosq, float theta, float z, float phi) {
    float sign = 0.0;
    if (z > 0.0) {
        sign = 1.0;
    }
    else {
        sign = -1.0;
    }
    float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
    float c = sqrt(1.0  - pow(w, 2.0));
    float alpha = - 0.5 * phi + theta;
    vec4 res =  vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
    return res;
}

tangVector tangDirection(vec4 p, vec4 q){
    // return the unit tangent to geodesic connecting p to q.
    // if FAKE_LIGHT is true, use the Euclidean metric for the computation (straight lines).

    if (FAKE_LIGHT) {
        // if FAKE_LIGHT is ON, just return the Euclidean vector pointing to q
        return tangVector(p, normalize(q-p));
    }

    else {
        // move p to the origin
        mat4 isom = nilMatrix(p);
        mat4 isomInv = nilMatrixInv(p);

        vec4 qOrigin = isomInv*q;

        // solve the problem !
        float z = qOrigin.z;

        vec4 resOrigin;
        if (z == 0.0) {
            // probably not needed (case contained in the next one)
            resOrigin =  vec4(qOrigin.z, qOrigin.y, qOrigin.z, 0.0);
        }
        else {


            float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
            float theta = atan(qOrigin.y, qOrigin.x);
            float phi = zero_height(rhosq, abs(z));

            resOrigin = _dirFromPhi(rhosq, theta, z, phi);
        }


        // move back to p
        return tangVector(p, isom * resOrigin);

        /*
        // solve the problem !
        float x3 = qOrigin.z;

        vec4 resOrigin = vec4(0.);
        if (x3 == 0.0) {
            // probably not needed (case contained in the next one)
            resOrigin =  vec4(qOrigin.z, qOrigin.y, qOrigin.z, 0.0);
        }
        else {
            float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
            float phi = newton_zero(rhosq, x3);
            float sign = 0.0;
            if (x3 > 0.0) {
                sign = 1.0;
            }
            else {
                sign = -1.0;
            }
            float w = sign * 2.0 * sin(0.5 * phi) / sqrt(rhosq + 4.0 * pow(sin(0.5 * phi), 2.0));
            float c = sqrt(1.0  - pow(w, 2.0));
            float alpha = - 0.5 * phi;
            if (qOrigin.x*qOrigin.y != 0.0){
                alpha = alpha + atan(qOrigin.y, qOrigin.x);
            }
            //float t = phi / w;

            //resOrigin =  t * vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
            resOrigin =  vec4(c * cos(alpha), c * sin(alpha), w, 0.0);
        }

        // move back to p
        return tangVector(p, isom * resOrigin);
        */
    }
}

tangVector tangDirection(tangVector u, tangVector v){
    // overload of the previous function in case we work with tangent vectors
    return tangDirection(u.pos, v.pos);
}

// return the unit tangent to second and thrid geodesic (by order of length) connecting p to q.
// if such vectors exists returns true and populate `directions`
// otherwise returns false
bool tangDirectionBis(vec4 p, vec4 q, out tangVector[2] directions) {
    // move p to the origin
    mat4 isom = nilMatrix(p);
    mat4 isomInv = nilMatrixInv(p);

    vec4 qOrigin = isomInv * q;

    // solve the problem !
    float z = qOrigin.z;

    vec4 resOrigin = vec4(0.);
    if (z == 0.0) {
        return false;
    }
    else {
        float rhosq = pow(qOrigin.x, 2.) + pow(qOrigin.y, 2.);
        float theta = atan(qOrigin.y, qOrigin.x);
        vec2 phis;
        bool check = zerobis_height(rhosq, abs(z), phis);
        if (check) {
            float phi0 = phis.x;
            float phi1 = phis.y;
            vec4 resOrigin0 = _dirFromPhi(rhosq, theta, z, phi0);
            vec4 resOrigin1 = _dirFromPhi(rhosq, theta, z, phi1);

            // move back to p
            directions[0] = tangVector(p, isom * resOrigin0);
            directions[1] = tangVector(p, isom * resOrigin1);
        }
        return check;
    }
}



tangVector flow(tangVector tv, float t){
    // Follow the geodesic flow during a time t
    // If the tangent vector at the origin is too close to the XY plane,
    // we use an asymptotic expansion of the geodesics.
    // This help to get rid of the noise around the XY plane
    // The threshold is given by the tolerance parameter
    float tolerance = 0.1;


    // move p to the origin
    mat4 isom = nilMatrix(tv.pos);
    mat4 isomInv = nilMatrixInv(tv.pos);

    // vector at the origin
    tangVector tvOrigin = translate(isomInv, tv);

    // solve the problem !
    float w = tvOrigin.dir.z;
    float c = sqrt(1. - w * w);
    float alpha = fixedatan(tvOrigin.dir.y, tvOrigin.dir.x);

    tangVector achievedFromOrigin = tangVector(ORIGIN, vec4(0.));

    /*
         TODO. question : the threshold should be  |w| << 1 or |wt| << 1 ?
    */


    if (abs(w * t) < tolerance){
        // use an asymptotic expansion (computed with SageMath

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

        float w1 = w;
        float w2 = w1 * w;
        float w3 = w2 * w;
        float w4 = w3 * w;
        float w5 = w4 * w;
        float w6 = w5 * w;
        float w7 = w6 * w;



        achievedFromOrigin.pos = vec4(
        c * t1 * cosa
        - (1. / 2.) * c * t2 * w1 * sina
        - (1. / 6.) * c * t3 * w2 * cosa
        + (1. / 24.) * c * t4 * w3 * sina
        + (1. / 120.) * c * t5 * w4 * cosa
        - (1. / 720.) * c * t6 * w5 * sina
        - (1. / 5040.) * c * t7 * w6 * cosa
        + (1. / 40320.) * c * t8 * w7 * sina,

        c * t * sina
        + (1. / 2.) * c * t2 * w1 * cosa
        - (1. / 6.) * c * t3 * w2 * sina
        - (1. / 24.) * c * t4 * w3 * cosa
        + (1. / 120.) * c * t5 * w4 * sina
        + (1. / 720.) * c * t6 * w5 * cosa
        - (1. / 5040.) * c * t7 * w6 * sina
        - (1. / 40320.) * c * t8 * w7 * cosa,

        (1. / 12.) * (c * c * t3 + 12. * t1) * w1
        - (1. / 240.) * c * c * t5 * w3
        + (1. / 10080.) * c * c * t7 * w5
        - (1. / 725760.) * c * c * t9 * w7,

        1);
        achievedFromOrigin.dir =  vec4(
        c * cosa
        - c * t1 * w1 * sina
        - (1. / 2.) * c * t2 * w2 * cosa
        + (1. / 6.) * c * t3 * w3 * sina
        + (1. / 24.) * c * t4 * w4 * cosa
        - (1. / 120.) * c * t5 * w5 * sina
        - (1. / 720.) * c * t6 * t6 * cosa
        + (1. / 5040.) * c * t7 * w7 * sina,

        c * sina
        + c * t1 * w1 * cosa
        - (1. / 2.) * c * t2 * w2 * sina
        - (1. / 6.) * c * t3 * w3 * cosa
        + (1. / 24.) * c * t4 * w4 * sina
        + (1. / 120.) * c * t5 * w5 * cosa
        - (1. / 720.) * c * t6 * t6 * sina
        - (1. / 5040.) * c * t7 * w7 * cosa,

        (1. / 4.) * (c * c * t2 + 4.) * w1
        - (1. / 48.) * c * c * t4 * w3
        + (1. / 1440.) * c * c * t6 * w5
        - (1. / 8060.) * c * c * t8 * w7,

        0
        );
    }

    /*
        For the record, the previous test without the asymptotic expansion

        if (w == 0.) {

            achievedFromOrigin.pos = vec4(c * cos(alpha) * t, c * sin(alpha) * t, 0. , 1.);
            achievedFromOrigin.dir = tvOrigin.dir;
    }
    */

    else {
        achievedFromOrigin.pos = vec4(
        2. * (c / w) * sin(0.5 * w * t) * cos(0.5 * w * t + alpha),
        2. * (c / w) * sin(0.5 * w * t) * sin(0.5 * w * t + alpha),
        w * t + 0.5 * pow(c / w, 2.) * (w * t - sin(w * t)),
        1.
        );

        achievedFromOrigin.dir = vec4(
        c * cos(w * t + alpha),
        c * sin(w * t + alpha),
        w + 0.5 * pow(c, 2.) / w  - 0.5 * pow(c, 2.) * cos(w * t) / w,
        0.
        );
    }

    // move back to p
    tangVector res = translate(isom, achievedFromOrigin);
    return res;
}


//--------------------------------------------
//Geometry of the Models
//--------------------------------------------


//Project onto the Klein Model
vec4 modelProject(vec4 u){
    return u;
}


//--------------------------------------------
//Geometry of Space
//--------------------------------------------

//project point back onto the geometry
vec4 geomNormalize(vec4 u){
    return u;
}


//-------------------------------------------------------
// LIGHT
//-------------------------------------------------------



//takes in a tangent vector and a length
// returns the function A(r,u)


//generalized sine curve of curvature k
float genSin(float k, float r){
    if(k<0.){//hpyerbolic trig
        return sinh(r*sqrt(abs(k)))/sqrt(abs(k));
    }
    else{//then k>0, so spherical trig
        return sin(r*sqrt(abs(k)))/sqrt(abs(k));
    }
}




float AreaDensity(float r,tangVector u){
    
    //fiber component of unit tangent vector
    float cosBeta=u.dir.z;
    
    
    float cb2=cosBeta*cosBeta;
    float sb2=1.-cb2;


    float kMin=0.25*(cb2-3.*sb2);
    float kMax=0.25;
    
    float aDens=abs(genSin(kMin,r)*genSin(kMax,r));
    
    return aDens;
}




//inverse area density, or fake lighting

float lightAtt(float dist, tangVector angle){
    //distance is the distance between the viewer and the lightsource.
    //angle is the unit tangent vector pointing from the light source towards the illuminated object
        if (FAKE_LIGHT_FALLOFF){
        //fake falloff
        return 0.1+0.5*dist;
    }
    
    //actual distance function
    return 0.2*exp(-dist*dist*10.)+AreaDensity(dist,angle);
        //0.1+areaElement(dist,angle);//make a function like surfArea in globalGeometry to compute this
}











//light intensity as a fn of distance
float lightAtt(float dist){
    //fake linear falloff
    return dist;

}





