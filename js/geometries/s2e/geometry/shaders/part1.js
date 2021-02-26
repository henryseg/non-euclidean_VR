//language=GLSL
export default `//

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
    float shift;
};

/**
 * Identity isometry
 */
const Isometry IDENTITY = Isometry(mat4(1.), 0.); /**< Identity isometry */

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
    mat4 matrix=isom1.matrix*isom2.matrix;
    float shift=isom1.shift+isom1.matrix[3][3]*isom2.shift;
    Isometry res= Isometry(matrix, shift);
    return reduceError(res);
}

/**
 * Return the inverse of the given isometry.
 */
Isometry geomInverse(Isometry isom) {
    mat4 inv=inverse(isom.matrix);
    float shift=-isom.matrix[3][3]*isom.shift;
    Isometry res=Isometry(inv, shift);
    return reduceError(res);
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


const Point ORIGIN = Point(vec4(0, 0, 1, 0)); /**< Origin of the geometry */

/**
 * Reduce the eventual numerical errors of the given point.
 */
Point reduceError(Point p){
    vec3 aux=normalize(p.coords.xyz);
    return Point(vec4(aux, p.coords.w));
}

/**
 * Translate the point by the isometry.
 */
Point applyIsometry(Isometry isom, Point p) {
    vec4 coords = isom.matrix * p.coords;
    coords.w+=isom.shift;
    Point res = Point(coords);
    return reduceError(res);
}

/**
 * Return a preferred isometry sending the origin to the given point.
 * Previously makeLeftTranslation.
 */

Isometry makeTranslation(Point p) {
    mat4 matrix = mat4(1.);
    float shift=p.coords.w;
    vec2 u = p.coords.xy;
    float c1 = length(u);
    if (c1 == 0.) {
        return Isometry(matrix, shift);
    }

    float c2 = 1. - p.coords.w;
    u = normalize(u);
    mat4 m = mat4(
    0, 0, -u.x, 0,
    0, 0, -u.y, 0,
    u.x, u.y, 0, 0,
    0, 0, 0, 0
    );
    matrix = matrix + c1 * m + c2 * m * m;
    return Isometry(matrix, shift);
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
    vec4 dir; /**< direction of the vector */
};


/**
 * Reduce the eventual numerical errors of the given vector.
 */
Vector reduceError(Vector v){
    v.pos = reduceError(v.pos);
    v.dir.xyz = v.dir.xyz + dot(v.pos.coords.xyz, v.dir.xyz) * v.pos.coords.xyz;
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
 * Rotate the given vector by a matrix representing an element of O(3).
 * @param[in] m an isometry of the tangent space. The matrix is written in the reference frame at the orign
 * @param[in] v a vector **at the origin**.
 */
Vector applyFacing(mat4 m, Vector v) {
    vec4 aux = m * vec4(v.dir.xy, v.dir.w, 0.);
    return Vector(v.pos, vec4(aux.xy, 0, aux.z));
}
`;