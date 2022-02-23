float _fakeDistanceFromOrigin(Point p) {
//    return abs(p.fiber);
    
    vec4 aux = toVec4(p);
    vec3 oh = vec3(0, 0, 1);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(aux.xyz, J * oh);

    // WARNING: DO NOT CHANGE THE 'IF ... THEN .. ELSE' STATEMENT BELOW
    // This hack is intended to make sure that q < -1, so that acosh does not crash
    // However when q is very large (long geodesics close to the horizontal component) the max causes numerical errors
    // This seems to work...
    // NB. Teleportation on the Javascript side does not fix the issue
    float fix;
    if (-q < 2.) fix = max(1., -q); else fix = -q;
    return 0.5 * sqrt(pow(acosh(fix), 2.) + pow(aux.w, 2.));
}

// fake distance between two points
float fakeDistance(Point p1, Point p2){
    Isometry shift = makeInvTranslation(p1);
    return _fakeDistanceFromOrigin(applyIsometry(shift, p2));
}

// overload of the previous function in case we work with tangent vectors
float fakeDistance(Vector v1, Vector v2){
    return fakeDistance(v1.pos, v2.pos);
}