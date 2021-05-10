// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Implementation of the geometry of SL(2,R) (part 1)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/***********************************************************************************************************************
 *
 * SL(2,R)
 * The elements of SL(2,R) seen as vectors in the basis E = (E0,E1,E2,E3)
 * The elements satisfy the relation - p0^2 - p1^2 + p2^2 + p3^2 = -1
 *
 **********************************************************************************************************************/

const vec4 SL_ORIGIN = vec4(1, 0, 0, 0);

// Correct the error to make sure that the point lies on the "hyperboloid"
vec4 SLreduceError(vec4 elt) {
    //float q = - elt.x * elt.x - elt.y * elt.y + elt.z * elt.z + elt.w * elt.w;
    mat4 J = mat4(
    -1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
    );
    float q = dot(elt, J * elt);
    return elt / sqrt(-q);
}

// change of model
// return the 2x2 matrix corresponding to elt
mat2 SLtoMatrix2(vec4 elt) {
    mat2 ex = mat2(
    1, 0,
    0, 1
    );
    mat2 ey = mat2(
    0, -1,
    1, 0
    );
    mat2 ez = mat2(
    0, 1,
    1, 0
    );
    mat2 ew = mat2(
    1, 0,
    0, -1
    );
    mat2 res = elt.x * ex + elt.y * ey + elt.z * ez + elt.w * ew;
    // reducing the eventual error
    res = res / sqrt(determinant(res));
    return res;
}

// change of model
// take a 2x2 matrix and return the corresponding element
vec4 SLfromMatrix2(mat2 m) {
    float a = m[0][0];
    float b = m[1][0];
    float c = m[0][1];
    float d = m[1][1];
    vec4 res = 0.5 * vec4(a + d, b - c, b + c, a - d);
    return SLreduceError(res);
}

// Projection from SL(2,R) to SO(2,1)
mat3 SLtoMatrix3(vec4 elt){
    mat4x3 aux1 = mat4x3(
    elt.x, elt.y, elt.z,
    -elt.y, elt.x, elt.w,
    elt.z, elt.w, elt.x,
    -elt.w, elt.z, elt.y
    );
    mat3x4 aux2 = mat3x4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y
    );
    mat3 res = aux1 * aux2;
    // TODO ? reduce errors to make sure the matrix belongs to SO(2,1) ?
    return res;
}

// Projection onto H^2
vec3 SLtoH2(vec4 elt) {
    mat3 m = SLtoMatrix3(elt);
    vec3 res = vec3(0., 0., 1.);
    res = m * res;
    // reduce the potential error
    // the point should be on a hyperboloid
    mat3 J = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, -1
    );
    float q = dot(res, J * res);
    res = res / sqrt(-q);
    return res;
}

// Return the inverse of the given element
vec4 SLinvert(vec4 elt) {
    vec4 res = vec4(elt.x, -elt.y, -elt.z, -elt.w);
    return SLreduceError(res);
}

// Return the 4x4 Matrix, corresponding to the current element, seen as an isometry of SL(2,R)
mat4 SLtoMatrix4(vec4 elt) {
    mat4 res = mat4(
    elt.x, elt.y, elt.z, elt.w,
    -elt.y, elt.x, elt.w, -elt.z,
    elt.z, elt.w, elt.x, elt.y,
    elt.w, -elt.z, -elt.y, elt.x
    );
    return res;
}

// Multiply two elements of SL2 in the following order: elt1 * elt2
vec4 SLmultiply(vec4 elt1, vec4 elt2) {
    mat4 L1 = SLtoMatrix4(elt1);
    return SLreduceError(L1 * elt2);
}

// Translate the element by the given angle along the fiber
vec4 SLtranslateFiberBy(vec4 elt, float angle) {
    float aux = 0.5 * angle;
    mat4 T = mat4(
    cos(aux), sin(aux), 0., 0.,
    -sin(aux), cos(aux), 0., 0.,
    0., 0., cos(aux), -sin(aux),
    0., 0., sin(aux), cos(aux)
    );
    return SLreduceError(T * elt);
}

// Rotate the element by an angle alpha (see Jupyter Notebook)
vec4 SLrotateBy(vec4 elt, float angle) {
    mat4 R = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, cos(angle), sin(angle),
    0, 0, -sin(angle), cos(angle)
    );
    return SLreduceError(R * elt);
}

// Flip the elemnt (see Jupyter Notebook)
vec4 SLflip(vec4 elt) {
    mat4 F = mat4(
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0
    );
    return SLreduceError(F * elt);
}


/***********************************************************************************************************************
 *
 * @struct Point
 * Structure for points in the geometry.
 *
 **********************************************************************************************************************/
struct Point{
    vec4 proj;
    float fiber;
};


const Point ORIGIN = Point(vec4(1, 0, 0, 0), 0.);/**< Origin of the geometry */


/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){
    p.proj = SLreduceError(p.proj);
    return p;
}

/**
 * change of model
 * the output is a vector (x,y,z,w) representing a point p where
 * - (x,y,z) is the projection of p in H^2 in the **hyperboloid** model
 * - w is the fiber coordinate
 */
vec4 toVec4(Point p) {
    vec4 res;
    // SLtoH2 already reduces the error, no need to do it again after
    res.xyz = SLtoH2(p.proj);
    res.w = p.fiber;
    return res;
}



/**
 * change of model
 * the output is a vector (x,y,1,w) representing a point p where
 * - (x,y) is the projection of p in H^2 in the **Klein** model
 * - w is the fiber coordinate
 */
vec4 toKlein(Point p){
    // toVec4 already reduces the error, no need to do it again after
    vec4 res = toVec4(p);
    res.xyz = res.xyz / res.z;
    return res;
}


/***********************************************************************************************************************
 *
 * @struct Isometry
 * Structure for isometries of the geometry.
 *
 **********************************************************************************************************************/
struct Isometry{
    mat4 matrix;
    float fiber;
    bool isInSL;
};

/**
 * Identity isometry
 */
const Isometry IDENTITY = Isometry(mat4(1.), 0., true); /**< Identity isometry */

/**
 * Reduce the eventual numerical errors of the given isometry.
 * @todo to be written
 */
Isometry reduceError(Isometry isom){
    return isom;
}

/**
 * Check if the isometry flip the fiber direction (see Javascript counter part)
 */
bool doesFlip(Isometry isom){
    if (isom.isInSL){
        return false;
    } else {
        float a00 = isom.matrix[0][0];
        float a10 = isom.matrix[1][0];
        float a01 = isom.matrix[0][1];
        float a11 = isom.matrix[1][1];
        return (a00 * a11 - a01 * a10) < 0.;
    }
}

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) {
    vec4 proj = isom.matrix * p.proj;
    float dir;
    if (doesFlip(isom)){
        dir = -1.;
    } else {
        dir = 1.;
    }
    vec4 aux = SLtranslateFiberBy(proj, -isom.fiber - dir * p.fiber);
    float fiber = isom.fiber + dir * p.fiber + 2. * atan(aux.y, aux.x);
    return Point(proj, fiber);
}

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously makeLeftTranslation.
 */

Isometry makeTranslation(Point p) {
    mat4 matrix = SLtoMatrix4(p.proj);
    return Isometry(matrix, p.fiber, true);
}

/**
 * Return a preferred isometry sending the given point to the origin.
 * Previously makeInvLeftTranslation.
 */
Isometry makeInvTranslation(Point p) {
    mat4 matrix = SLtoMatrix4(SLinvert(p.proj));
    return Isometry(matrix, -p.fiber, true);
}

/**
 * Multiply the two given isometries.
 */
Isometry multiply(Isometry isom1, Isometry isom2) {
    Point aux2 = Point(isom2.matrix * SL_ORIGIN, isom2.fiber);
    Point aux = applyIsometry(isom1, aux2);
    return Isometry(isom1.matrix * isom2.matrix, aux.fiber, isom1.isInSL && isom2.isInSL);
}

/**
 * Return the inverse of the given isometry.
 */
Isometry geomInverse(Isometry isom) {
    float fiber;
    if (doesFlip(isom)){
        fiber = isom.fiber;
    } else {
        fiber = -isom.fiber;
    }
    mat4 inv = inverse(isom.matrix);
    return Isometry(inv, fiber, isom.isInSL);
}


/***********************************************************************************************************************
 *
 * @struct Vector
 * Data type for manipulating points in the tangent bundle
 * A Vector is given by
 * - pos : a point in the space
 * - dir: a tangent vector at pos
 * The direction is the pull back of the tangent vector at the origin - by the unique such element of SL(2,R)
 * Local direction are written in the orthonormal basis (e_x, e_y, e_w) where
 * . e_x is the direction of the x coordinate of H^2
 * . e_y is the direction of the y coordinate in H^2
 * . e_w is the direction of the fiber
 **********************************************************************************************************************/
struct Vector{
    Point pos;//** Underlying point */
    vec3 dir;//** Pull back of the tangent vector */
};

/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){
    v.pos = reduceError(v.pos);
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
    if (isom.isInSL) {
        return Vector(p, v.dir);
    } else {
        vec4 aux = vec4(0, v.dir.zxy);
        mat4 push = SLtoMatrix4(v.pos.proj);
        mat4 pull = SLtoMatrix4(SLinvert(p.proj));
        vec4 dir = pull * isom.matrix * push * aux;
        return Vector(p, aux.zwy);
    }
}


/**
 * Rotation the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    // change of coordinates to write the tangent vector in the reference frame coordiates
    // there is normally a scaling factor 2, that disapears in the conjugation.
    vec4 aux = m * vec4(v.dir, 0);
    return Vector(v.pos, aux.xyz);
}

void initFlow(Vector v){
}
`;
