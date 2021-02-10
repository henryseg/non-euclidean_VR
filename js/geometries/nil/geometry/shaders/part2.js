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
    float c = v.dir.z;
    float a = sqrt(1. - c * c);

    vec4 coords;
    if (c == 0.){
        coords = vec4(t * v.dir.x, t * v.dir.y, t * v.dir.z, 1);
    } else {
        // matrix rotating by an angle alpha  and scaling by a.
        mat2 rotationAlpha = mat2(
        v.dir.x, v.dir.y,
        -v.dir.y, v.dir.x
        );
        coords = vec4(
        (2. / c) * sin(0.5 * c * t) * cos(0.5 * c * t),
        (2. / c) * sin(0.5 * c * t) * sin(0.5 * c * t),
        c * t + 0.5 * (a / c) * (a / c) * (c * t - sin(c * t)),
        1
        );
        coords = vec4(rotationAlpha * coords.xy, coords.zw);
    }

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
}


/**
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 @todo implement numerical approximation when ct is very small
 */
//Vector flow(Vector v, float t){
//    // cylindrical coordinates of v
//    float c = v.dir.z;
//    float a = sqrt(1. - c * c);
//    float alpha = 0.;
//    if (a != 0.){
//        alpha = atan(v.dir.y, v.dir.x);
//    }
//
//    vec4 coords;
//    if (c == 0.){
//        coords = vec4(t * v.dir.x, t * v.dir.y, t * v.dir.z, 1);
//    } else {
//        coords = vec4(
//        2. * (a / c) * sin(0.5 * c * t) * cos(0.5 * c * t + alpha),
//        2. * (a / c) * sin(0.5 * c * t) * sin(0.5 * c * t + alpha),
//        c * t + 0.5 * (a / c) * (a / c) * (c * t - sin(c * t)),
//        1
//        );
//    }
//
//    Point targetFromOrigin = Point(coords);
//    Isometry shift = makeTranslation(v.pos);
//    Point target = applyIsometry(shift, targetFromOrigin);
//
//    vec4 dir = vec4(a * cos(c * t + alpha), a * sin(c * t + alpha), c, 0);
//
//    return Vector(target, dir);
//}`;
