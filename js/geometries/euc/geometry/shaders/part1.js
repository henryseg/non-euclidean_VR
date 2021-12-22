// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Implementation of the euclidean geometry (part 1)
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
    1, 0., 0., 0.,
    0., 1, 0., 0.,
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
    1, 0., 0., 0.,
    0., 1, 0., 0.,
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
 *
 **********************************************************************************************************************/
struct Vector{
    Point pos;///< Underlying point
    vec4 dir;///< Direction of the vector
};

/**
 * Return the zero vector at pos
 */
Vector zeroVector(Point pos){ 
    return Vector(pos, vec4(0)); 
}

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
 * Previously scalarMult.
 * @return @f$ s v @f$
 */
Vector multiplyScalar(float s, Vector v){
    return Vector(v.pos, s * v.dir);
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
    Point p = applyIsometry(isom, v.pos);
    return Vector(p, isom.matrix * v.dir);
}


/**
 * Rotation the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    return Vector(v.pos, m * v.dir);
}

void initFlow(Vector v){
}
`;
