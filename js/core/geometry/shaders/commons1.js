// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Geometric computations common to all the geometries (part 1)
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Return the opposite of the given vector.
 * Previously turnAround.
 * @return -v
 */
Vector negate(Vector v) {
    return multiplyScalar(-1., v);
}


/**
 * Return the length of the given vector.
 * Previously tangNorm.
 */
float geomLength(Vector v){
    return sqrt(geomDot(v, v));
}

/**
 * Normalize the given vector (so that it has length one).
 * Previously tangNormalize.
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
 * Reflect the vector v across the plane whose normal is n.
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
}`
;