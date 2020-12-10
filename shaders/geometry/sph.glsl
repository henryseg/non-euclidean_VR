/***********************************************************************************************************************
 * @file
 * This file is a model to impletement other geometries.
 * The content of the structures can be customized.
 * The signatures and the roles of each method need to be implemented strictly.
 **********************************************************************************************************************/



/***********************************************************************************************************************
 *
 * @struct Isometry
 * Structure for isometries of the geometry.
 *
 **********************************************************************************************************************/
struct Isometry{
    mat4 matrix;
};

/**
 * Identity isometry
 */
const Isometry IDENTITY = Isometry(mat4(1.)); /**< Identity isometry */

/**
 * Reduce the eventual numerical errors of the given isometry.
 */
Isometry reduceError(Isometry isom){
    return isom;
}

/**
 * Multiply the two given isometries.
 */
Isometry multiply(Isometry isom1, Isometry isom2) {
    return Isometry(isom1.matrix * isom2.matrix);
}

/**
 * Return the inverse of the given isometry.
 */
Isometry geomInverse(Isometry isom) {
    return Isometry(inverse(isom.matrix));
}

/***********************************************************************************************************************
 *
 * @struct Point
 * Structure for points in the geometry.
 *
 **********************************************************************************************************************/
struct Point{
    vec4 coords;
};


const Point ORIGIN = Point(vec4(0, 0, 0, 1)); /**< Origin of the geometry */

/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){
    return Point(normalize(p.coords));
}

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) {
    vec4 coords = isom.matrix * p.coords;
    Point res = Point(coords);
    return reduceError(res);
}

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously `makeLeftTranslation`.
 */

Isometry makeTranslation(Point p) {
    mat4 res = mat4(1.);
    vec3 u = p.coords.xyz;
    float c1 = length(u);
    if (c1 == 0) {
        return Isometry(res);
    }

    float c2 = 1 - p.coords.w;
    u = normalize(u);
    mat4 m = mat4(
    0, 0, 0, -u.x,
    0, 0, 0, -u.y,
    0, 0, 0, -u.z,
    u.x, u.y, u.z, 0
    );
    res = res + c1 * m + c2 * m * m;
    return Isometry(res);
}

/**
 * Return a preferred isometry sending the given point to the origin.
 * Previously `makeInvLeftTranslation`.
 */
Isometry makeInvTranslation(Point p) {
    Isometry isom = makeTranslation(p);
    return geomInverse(isom);
}

/***********************************************************************************************************************
 *
 * @struct Vector
 * Structure for vector in the tangent bundle of the geometry.
 * For computation of gradient, one needs to fix for each geometry, a section of the frame bundle.
 *
 **********************************************************************************************************************/
struct Vector{
    Point pos; /**< Underlying point */
    vec4 dir; /**< direction of the vector */
};


/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){
    return Vector(reduceError(v.pos), v.dir);
}

/**
 * Add the given vectors.
 * @return @f$ v_1 + v_2 @f$
 */
Vector add(Vector v1, Vector v2){
    return Vector(v1.pos, v1.dir + v2.dir);
}

/**
 * Subtrack the given vectors.
 * @return @f$ v_1 - v_2 @f$
 */
Vector sub(Vector v1, Vector v2){
    return Vector(v1.pos, v1.dir - v2.dir);
}

/**
 * Multiply the vector by a scalar.
 * Previously `scalarMult`.
 * @return @f$ s v @f$
 */
Vector multiplyScalar(float s, Vector v){
    return Vector(v.pos, s * v.dir);
}

/**
 * Return the dot product of the two vectors (with respect to the metric tensor).
 * Previouly `tangDot`.
 */
float geomDot(Vector v1, Vector v2) {
    return dot(v1.dir, v2.dir);
}

/**
 * Translate the vector by the isometry.
 */
Vector applyIsometry(Isometry isom, Vector v) {
    Point p = applyIsometry(isom, v.pos);
    return Vector(p, isom.matrix * v.dir);
}


/**
 * Rotate the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    return Vector(v.pos, m * v.dir);
}

/**
 * Maybe this part should be moved after some commons are defined
 * so that we can use geomNormalize()
 */

/**
 * Section of the frame bundle.
 * The section at the origin, should coincide with the reference frame.
 * @param[in] p point on the geometry
 * @param[out] frame computed frame at the given point
 * @todo Not completely convinced by this - and the function createVector() and smallShift().
 * If you know a better way to do it…
 */
void frame(Point p, out Vector[3] frame){
    vec4 dir0 = vec4(p.coords.w, 0, 0, -p.coords.x);
    vec4 dir1 = vec4(0, p.coords.w, 0, -p.coords.y);
    vec4 dir2 = vec4(0, 0, p.coords.x, -p.coords.z);
    dir0 = normalize(dir0);
    dir1 = normalize(dir1);
    dir2 = normalize(dir2);
    frame[0] = Vector(p, dir0);
    frame[1] = Vector(p, dir1);
    frame[2] = Vector(p, dir2);
}


/**
 * Compute (an approximation of) the point obtained from `p` by moving the given direction.
 * @param[in] p initial point.
 * @param[in] dp the coordinate of the direction with repsect to the frame provided by frame()
 */
Point smallShift(Point p, vec3 dp){
    Vector[3] frame;
    frame(p, frame);
    vec4 coords = p.coords + dp[0] * frame[0].dir + dp[1] * frame[1].dir + dp[2] * frame[2].dir;
    Point res = Point(coords);
    return reduceError(res);
}


/**
 * Flow the vector `v` for a time `t`.
 * The vector `v` is assume to be a **unit** vector
 */
Vector flow(Vector v, float t){
    vec4 coords = cos(t) * v.pos.coords + sin(t) * v.dir;
    Point pos = Point(coords);
    vec4 dir = -sin(t) * v.pos.coords + cos(t) * v.dir;
    return Vector(pos,dir);
}

