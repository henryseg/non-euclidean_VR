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
 */
void frame(Point p, out Vector[3] f){
    f[0] = Vector(p, vec4(1, 0, 0, 0));
    f[1] = Vector(p, vec4(0, 1, 0, 0));
    f[2] = Vector(p, vec4(0, 0, 1, 0));
}

/**
 * Section of the orthonormal frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 */
void orthoFrame(Point p, out Vector[3] f){
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
    vec4 aux = vec4(dp, 0);
    return Point(p.coords + aux);
}

Vector smallShift(Vector v, vec3 dp){
    Point pos = smallShift(v.pos, dp);
    return Vector(pos, v.dir);
}


/**
 * Flow the vector v for a time t.
 * The vector v is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){
    vec4 coords = v.pos.coords + t * v.dir;
    Point p = Point(coords);
    return Vector(p, v.dir);
}
