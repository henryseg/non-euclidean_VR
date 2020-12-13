/**
 * Position on the sphere.
 */
varying vec3 spherePosition;


/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec4 aux = vec4(coords, 0);
    aux = normalize(aux);
    aux = inverse(camera) * aux;
    float c = cosh(ipDist);
    float s = sinh(ipDist);
    mat4 m = c * mat4(
        c * c, 0, 0, s * c,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -s * c, 0, 0, -s * s
    );
    aux.w = 1.;
    aux = m * aux;
    aux.w = 0.;
    aux = camera * aux;
    aux = normalize(aux);
    Vector v = createVector(ORIGIN, aux.xyz);
    return applyPosition(eyePosition, v);
}