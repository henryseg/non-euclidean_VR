
//----------------------------------------------------------------------------------------------------------------------
// Raymarch Primitives
//----------------------------------------------------------------------------------------------------------------------


float sphereSDF(Point p, Point center, float radius){
    //   return fakeDist(p, center) - radius;

    float threshold = 1000. * EPSILON;
    float aux = fakeDist(p, center);
    if (aux - radius > threshold) {
        // estimation for point very far outside of the sphere
        return aux - radius;
    }
    else if (2. * aux - radius < -threshold) {
        // estimation for points very far inside of the sphere
        return 2. * aux - radius;
    }
    else {
        // exact compution around the sphere
        return exactDist(p, center) - radius;
    }
}

float cylSDF(Point p, float r){
    vec4 aux = toVec4(p);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float s = 0.;
    vec3 center = vec3(0., s, sqrt(1. + s * s));
    float q = dot(aux.xyz, J * center);
    // WARNING: SEE _fakeDistToOrigin
    float fix;
    if (-q < 2.) fix = max(1., -q); else fix = -q;
    return acosh(fix) - r;
}


// fake ellipsoid centered at the origin
float ellipsoidSDF(Point p, float radius, float wRescale){
    vec4 aux = toVec4(p);
    vec3 oh = vec3(0, 0, 1);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(aux.xyz, J * oh);
    // WARNING: SEE _fakeDistToOrigin
    float fix;
    if (-q < 2.) fix = max(1., -q); else fix = -q;
    float dist = 0.5 * sqrt(pow(acosh(fix), 2.) + pow(aux.w / wRescale, 2.));
    return dist - radius;
}






float halfSpace(Point p){
    float X=toVec4(p).x;
   // float X=toKlein(p).x;
    return abs(asinh(X))-0.1;
}

float halfSpace2(Point p){
    Point pos=fromVec4(vec4(.5,0.,1.12,0.));
    Isometry iso=makeInvLeftTranslation(pos);
    return halfSpace(translate(iso,p));
    
}

float halfSpace3(Point p){
    Point pos=fromVec4(vec4(-.5,0.,1.12,0.));
    Isometry iso=makeInvLeftTranslation(pos);
    return halfSpace(translate(iso,p));
    
}

