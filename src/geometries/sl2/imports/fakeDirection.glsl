Vector _fakeDirectionFromOrigin(Point p) {
    //    return abs(p.fiber);

    vec4 aux = toVec4(p);
    vec3 oh = vec3(0, 0, 1);
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float c = dot(aux.xyz, J * oh);

    // WARNING: DO NOT CHANGE THE 'IF ... THEN .. ELSE' STATEMENT BELOW
    // This hack is intended to make sure that q < -1, so that acosh does not crash
    // However when q is very large (long geodesics close to the horizontal component) the max causes numerical errors
    // This seems to work...
    // NB. Teleportation on the Javascript side does not fix the issue
    float fix;
    if (-c < 2.) fix = max(1., -c); else fix = -c;

    float lenAux = acosh(fix);
    vec3 dirAux = aux.xyz + c * oh;
    dirAux = (lenAux / sqrt(c * c  - 1.)) * dirAux;
    Vector res = Vector(p, vec3(dirAux.xy, aux.w));
    return geomNormalize(res);
}

// fake distance between two points
Vector fakeDirection(Point p1, Point p2){
    Isometry shift = makeTranslation(p1);
    Isometry shiftInv = makeInvTranslation(p1);
    Vector _dirFromOrigin = _fakeDirectionFromOrigin(applyIsometry(shiftInv, p2));
    return applyIsometry(shift, _dirFromOrigin);
}

// overload of the previous function in case we work with tangent vectors
Vector fakeDirection(Vector v1, Vector v2){
    return fakeDirection(v1.pos, v2.pos);
}