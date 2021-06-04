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
 * Refract the vector v through a surface
 * @param[in] v the vector to refract (v is assumed to be a unit vector)
 * @param[in] n the normal vector to the surface (n is assumed to be a unit vector)
 * @param[in] r ratio of IOR: current/entering
 */
Vector geomRefract(Vector v, Vector n, float r){
    float cosTheta1 = -geomDot(n, v);
    float sinTheta2Sq = r * r * (1. - cosTheta1 * cosTheta1);

    if (sinTheta2Sq > 1.){
        //TIR  
        return zeroVector(v.pos);
    }
    //if we are not in this case, then refraction actually occurs
    float cosTheta2 = sqrt(1. - sinTheta2Sq);
    float aux = r * cosTheta1 - cosTheta2;
    return add(multiplyScalar(r, v), multiplyScalar(aux, n));
}

/**
 * Refract the vector v through the surface with normal vector n, and ratio of indices IOR=current/entering
 */
//Vector geomRefract(Vector incident, Vector normal, float n){
//
//    float cosX=-dot(normal,incident);
//    float sinT2=n*n* (1.0 - cosX * cosX);
//
//    if(sinT2>1.){return Vector(incident.pos,vec3(0.,0.,0.));}//TIR  
//    //if we are not in this case, then refraction actually occurs
//
//    float cosT=sqrt(1.0 - sinT2);
//    vec3 dir=n*incident.dir+(n * cosX - cosT) * normal.dir;
//    return Vector(incident.pos, dir);
//}

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