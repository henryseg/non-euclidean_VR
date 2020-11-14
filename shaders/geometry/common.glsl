/***********************************************************************************************************************
 *
 * Geometric computations common to all the geometries
 *
 **********************************************************************************************************************/



/**
 * Return the opposite of the given vector.
 * Previously `turnAround`.
 * @return -v
 */
Vector negate(Vector v) {
    return multiplyScalar(-1., v);
}


/**
 * Return the length of the given vector.
 * Previously `tangNorm`.
 * Overload GLSL dot product (hopefully this is not an issue).
 */
float geomLength(Vector v){
    return sqrt(geomDot(v, v));
}

/**
 * Normalize the given vector (so that it has length one).
 * Previously `tangNormalize`.
 * Overload GLSL normalization (hopefully this is not an issue).
 */
Vector geomNormalize(Vector v){
    float a = geomLength(v);
    return multiplyScalar(1./a, v);
}

/**
 * Return the cosine of the angle between two vectors
 */
float cosAngle(Vector v1, Vector v2){
    float a1 = geomLength(v1);
    float a2 = geomLength(v2);
    return geomDot(v1, v2)/ (a1 * a2);
}

/**
 * Reflect the vector `v` across the plane whose normal is `n`.
 * Following the same convention as
 * <a href=" https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/reflect.xhtml">OpenGL reflect</a>
 * @param[in] v the vector to reflect
 * @param[in] n the normal to the plane, it should be a unit vector
 * @returns the reflectec vector, i.e. @f$ v - 2 \left<v,n\right> n @f$
 */
Vector geomReflect(Vector v, Vector n){
    return sub(v, multiplyScalar(2. * geomDot(v, n), n));
}

/**
 * Return a preferred isometry sending the origin to the underlying point.
 * Overlaod the function makeTranslation().
 */
Isometry makeTranslation(Vector v) {
    return makeTranslation(v.pos);
}

/**
 * Return a preferred isometry sending the underlying point to the origin.
 * Overlaod the function makeInvTranslation().
 */
Isometry makeInvTranslation(Vector v) {
    return makeInvTranslation(v.pos);
}


/**
 * Compute the vector at p whose coordinates are given by the section of the frame bundle.
 * See frame().
 */
Vector createVector(Point p, vec3 coords){
    Vector[3] f;
    frame(p, f);
    Vector c0 = multiplyScalar(coords[0], f[0]);
    Vector c1 = multiplyScalar(coords[1], f[1]);
    Vector c2 = multiplyScalar(coords[2], f[2]);
    return add(c0, add(c1, c2));
}

/**
 * Compute the direction and length of the shortest geodesic from `p` to `q`.
 * The result are passed to the variables `dir` and `len`.
 */
void direction(Point p, Point q, out Vector dir, out float len){
    Vector[MAX_DIRS] dirs;
    float[MAX_DIRS] lens;
    directions(p, q, 1, dirs, lens);
    dir = dirs[0];
    len = lens[0];
}

/**
 * Let `p` and `q` be the underlying point of `u` and `v`.
 * Compute the direction and length of the geodesics from p to q.
 * Overlaod the function directions()
 */
int directions(Vector u, Vector v, int n, out Vector[MAX_DIRS] dirs, out float[MAX_DIRS] lens){
    return directions(u.pos, v.pos, n, dirs, lens);
}

/**
 * Let `p` and `q` be the underlying point of `u` and `v`.
 * Compute the direction and length of the shortest geodesic from `p` to `q`.
 * Overlaod the function direction()
 */
void direction(Vector u, Vector v, out Vector dir, out float len){
    Vector dirAux;
    float lenAux;
    direction(u.pos, v.pos, dirAux, lenAux);
    dir = dirAux;
    len = lenAux;
}
