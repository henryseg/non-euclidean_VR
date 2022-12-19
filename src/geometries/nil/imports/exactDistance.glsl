/***********************************************************************************************************************
 * Exact distance in Nil
 *
 * Requires fakeDistance and utils
 **********************************************************************************************************************/

// Compute the exact distance between p and q
float exactDistance(Point p, Point q) {
    // move p to the origin and q accordingly
    Isometry shift = makeInvTranslation(p);
    Point qOrigin = applyIsometry(shift, q);

    // if needed we flip the point qOrigin so that its z-coordinates is positive.
    // this does not change its distance to the origin
    if (qOrigin.coords.z < 0.){
        qOrigin = applyIsometry(FLIP, qOrigin);
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

float exactDistance(Vector u, Vector v){
    // overload of the previous function in case we work with tangent vectors
    return exactDistance(u.pos, v.pos);
}