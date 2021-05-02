// language=GLSL
export default `//
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
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] f){
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
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 * New version, without computing the angle alpha.
 * Indeed one only needs to **rotate** by an angle alpha.
 * Thus we should not go back and forth between the angle alpha and its sine/cosine.
 * @todo implement numerical approximation when ct is very small.
 * The noise is only visible when the camera's threshold is very small.
 */
Vector flow(Vector v, float t){
    // cylindrical coordinates of v
    // v = [a cos(alpha), a sin(alpha), c, 0]
    float tolerance = 0.1;
    float c = v.dir.z;
    float a = sqrt(1. - c * c);

    vec4 coords;
    float ct = c * t;
    // matrix rotating by an angle alpha  and scaling by a.
    mat2 rotationAlpha = mat2(
    v.dir.x, v.dir.y,
    -v.dir.y, v.dir.x
    );

    if (abs(ct) < tolerance){
        // use an asymptotic expansion (computed with SageMath)
        // expansion at order 1 seems to be enough for VR
        // use order 2 just to be safe.
        float a2t2 = a * a * t * t;
        coords = vec4(t, 0, 0, 1);
        coords = coords + vec4(0, t / 2., a2t2 / 12. + 1., 0) * ct;
        float ct2 = ct * ct;
        coords = coords + (1. / 2.) * vec4(- t / 3., 0, 0, 0) * ct2;
        //float ct3 = ct2 * ct;
        //coords = coords + (1. / 6.) * vec4(0, - t / 4., - a2t2 / 40., 0) * ct3;
        //float ct4 = ct3 * ct;
        //coords = coords + (1. / 24.) * vec4(t / 5., 0, 0, 0) * ct4;
        //float ct5 = ct4 * ct;
        //coords = coords + (1. / 120.) * vec4(0, t / 6., a2t2 / 84., 0) * ct5;
    } else {
        coords = vec4(
        (2. / c) * sin(0.5 * c * t) * cos(0.5 * c * t),
        (2. / c) * sin(0.5 * c * t) * sin(0.5 * c * t),
        c * t + 0.5 * (a / c) * (a / c) * (c * t - sin(c * t)),
        1
        );
    }

    coords = vec4(rotationAlpha * coords.xy, coords.zw);
    Point targetFromOrigin = Point(coords);
    Isometry shift = makeTranslation(v.pos);
    Point target = applyIsometry(shift, targetFromOrigin);

    // matrix rotating by an angle ct
    float cosCt = cos(c * t);
    float sinCt = sin(c * t);
    mat2 rotationCt = mat2(
    cosCt, sinCt,
    -sinCt, cosCt
    );
    vec4 dir = vec4(rotationCt * v.dir.xy, v.dir.zw);

    return Vector(target, dir);
}`;
