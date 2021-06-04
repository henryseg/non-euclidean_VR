// language=GLSL
export default `//


/***********************************************************************************************************************
 * @file
 * This file is a model to impletement other geometries.
 * The content of the structures can be customized.
 * The signatures and the roles of each method need to be implemented strictly.
 **********************************************************************************************************************/


// Auxiliary function : lorentzian geometry in R^4

float hypDot(vec4 v1, vec4 v2){
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z - v1.w * v2.w;
}

float hypLengthSq(vec4 v) {
    return abs(hypDot(v, v));
}

float hypLength(vec4 v) {
    return sqrt(hypLengthSq(v));
}

vec4 hypNormalize(vec4 v) {
    return v / hypLength(v);
}

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
 * @todo : Think of the best way to do this.
 * When the coordinates of the boost are too big, reduceError makes everything worse
 * Indeed the hypDot takes squares and then compute a difference...
 */
Isometry reduceError(Isometry isom){
//    vec4 col0 = isom.matrix[0];
//    vec4 col1 = isom.matrix[1];
//    vec4 col2 = isom.matrix[2];
//    vec4 col3 = isom.matrix[3];
//
//    col0 = hypNormalize(col0);
//
//    col1 = col1 - hypDot(col0, col1) * col0;
//    col1 = hypNormalize(col1);
//
//    col2 = col2 - hypDot(col0, col2) * col0;
//    col2 = col2 - hypDot(col1, col2) * col1;
//    col2 = hypNormalize(col2);
//
//    col3 = col3 - hypDot(col0, col3) * col0;
//    col3 = col3 - hypDot(col1, col3) * col1;
//    col3 = col3 - hypDot(col2, col3) * col2;
//    col3= hypNormalize(col3);
//
//    return Isometry(mat4(col0, col1, col2, col3));


    return isom;
}

/**
 * Multiply the two given isometries.
 */
Isometry multiply(Isometry isom1, Isometry isom2) {
    Isometry res = Isometry(isom1.matrix * isom2.matrix);
    return reduceError(res);
}

/**
 * Return the inverse of the given isometry.
 */
Isometry geomInverse(Isometry isom) {
    mat4 inv = inverse(isom.matrix);
    Isometry res = Isometry(inv);
    return reduceError(res);

}

/***********************************************************************************************************************
 *
 * @struct Point
 * Structure for points in the geometry.
 *
 **********************************************************************************************************************/
struct Point{
// Define here the fields of the structure
    vec4 coords;
};


const Point ORIGIN = Point(vec4(0, 0, 0, 1)); /**< Origin of the geometry */

/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){
    vec4 coords = hypNormalize(p.coords);
    return Point(coords);
}

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) {
    vec4 coords = isom.matrix * p.coords;
    Point res= Point(coords);
    return reduceError(res);
}

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously makeLeftTranslation.
 */

Isometry makeTranslation(Point p) {

    mat4 matrix = mat4(1.);
    vec3 u = p.coords.xyz;
    float c1 = length(u);

    if (c1 == 0.){
        return Isometry(matrix);
    }

    float c2 = p.coords.w-1.;
    u = normalize(u);

    mat4 m = mat4(
    0., 0., 0., u.x,
    0., 0., 0., u.y,
    0., 0., 0., u.z,
    u.x, u.y, u.z, 0.
    );

    matrix = matrix + c1 * m + c2 * m * m;
    Isometry res = Isometry(matrix);
    return reduceError(res);
}

/**
 * Return a preferred isometry sending the given point to the origin.
 * Previously makeInvLeftTranslation.
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
    vec4 dir;
// Define here the other fields of the structure
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
    v.pos = reduceError(v.pos);
    v.dir = v.dir + hypDot(v.pos.coords, v.dir) * v.pos.coords;
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
    mat4 g = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1
    );

    return dot(v1.dir, g*v2.dir);
}


/**
 * Translate the vector by the isometry.
 */
Vector applyIsometry(Isometry isom, Vector v) {
    vec4 coords = isom.matrix * v.pos.coords;
    Point pos = Point(coords);
    Vector res = Vector(pos, isom.matrix * v.dir);
    return reduceError(res);
}


/**
 * Rotate the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    return Vector(v.pos, m * v.dir);
}

void initFlow(Vector v){
}
`;