// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Implementation of the Nil geometry (part 1)
 *
 ***********************************************************************************************************************
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
 * @todo to be written
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
    mat4 inv = inverse(isom.matrix);
    return Isometry(inv);
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


const Point ORIGIN = Point(vec4(0, 0, 0, 1));/**< Origin of the geometry */


/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){
    return p;
}

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) {
    vec4 coords = isom.matrix * p.coords;
    return Point(coords);
}

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously makeLeftTranslation.
 */

Isometry makeTranslation(Point p) {
    vec4 c = p.coords;
    mat4 matrix =  mat4(
    1, 0., -0.5 * c.y, 0.,
    0., 1, 0.5 * c.x, 0.,
    0., 0., 1., 0,
    c.x, c.y, c.z, 1.
    );
    return Isometry(matrix);
}

/**
 * Return a preferred isometry sending the given point to the origin.
 * Previously makeInvLeftTranslation.
 */
Isometry makeInvTranslation(Point p) {
    vec4 c = p.coords;
    mat4 matrix =  mat4(
    1, 0., 0.5 * c.y, 0.,
    0., 1, -0.5 * c.x, 0.,
    0., 0., 1., 0,
    -c.x, -c.y, -c.z, 1.
    );
    return Isometry(matrix);
}

/***********************************************************************************************************************
 *
 * @struct Vector
 * Structure for vector in the tangent bundle of the geometry.
 * For computation of gradient, one needs to fix for each geometry, a section of the frame bundle.
 * In this description,
 * - pos is the underlying position of the vector (nothing fancy here)
 * - isom is an isometry
 * - dir is the **pullback** at the origin of the vector by isom. (The fourth coordinate of dir is always zero.)
 *
 * pos and isom contains redundant information.
 * Indeed pos is the image of the origin by isom.
 * It the the job of the developper to keep these constistant.
 * Having pos available, should reduces the number of computations, when we call all the SDFs, hopefully.
 *
 **********************************************************************************************************************/
struct Vector{
    Point pos;///< Underlying point
    Isometry isom;///< An isometry moving the origin to pos
    vec4 dir;///< Direction of the vector
};

/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){
    return v;
}

/**
 * Add the given vectors.
 * @return @f$ v_1 + v_2 @f$
 */
Vector add(Vector v1, Vector v2){
    return Vector(v1.pos, v1.isom, v1.dir + v2.dir);
}

/**
 * Subtrack the given vectors.
 * @return @f$ v_1 - v_2 @f$
 */
Vector sub(Vector v1, Vector v2){
    return Vector(v1.pos, v1.isom, v1.dir - v2.dir);
}

/**
 * Multiply the vector by a scalar.
 * Previously scalarMult.
 * @return @f$ s v @f$
 */
Vector multiplyScalar(float s, Vector v){
    return Vector(v.pos, v.isom, s * v.dir);
}


/**
 * Return the dot product of the two vectors (with respect to the metric tensor).
 * Previouly tangDot.
 */
float geomDot(Vector v1, Vector v2) {
    return dot(v1.dir, v2.dir);
}


/**
 * Translate the vector by the isometry.
 */
Vector applyIsometry(Isometry isom, Vector v) {
    Isometry isometry = multiply(isom, v.isom);
    Point pos = applyIsometry(isometry, ORIGIN);
    return Vector(pos, isometry, v.dir);
}


/**
 * Rotation the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    return Vector(v.pos, v.isom, m * v.dir);
}
`;
