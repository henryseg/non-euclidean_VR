// language=GLSL
export default `//
/**
 * Square of the fake height. 
 * Fake height : bound on the height of the ball centered at the origin passing through p
 */
float fakeHeightSq(Point p) {
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

/**
 * Measure the distance between two points in the geometry.
 * Fake version
 */
float fakeDistance(Point p, Point q){
    Isometry shift = makeInvTranslation(p);
    Point qOrigin = applyIsometry(shift, q);
    // we now need the distance between the origin and p
    float x = qOrigin.coords.x;
    float y = qOrigin.coords.y;
    float rhosq = x * x + y * y;
    float hsq = fakeHeightSq(qOrigin);

    return pow(0.2 * rhosq * rhosq + 0.8 * hsq * hsq, 0.25);
}

/** 
 * Overload of the previous function in case we work with tangent vectors
 */ 
float fakeDistance(Vector u, Vector v){
    return fakeDistance(u.pos, v.pos);
}
`;