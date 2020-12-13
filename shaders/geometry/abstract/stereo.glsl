/**
 * Position on the sphere.
 */
varying vec3 spherePosition;


/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    //    vec4 dir = normalize(vec4(coords,0));
    //    vec4 aux = inverse(camera) * dir;
    vec4 aux = normalize(vec4(coords,0));
    Vector v = createVector(ORIGIN, aux.xyz);
    return applyPosition(eyePosition, v);
}