/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec4 aux = vec4(coords, 0);
    aux = inverse(eyeMatrix) * aux;
    aux = normalize(aux);
    Vector v = createVector(ORIGIN, aux.xyz);
    return applyPosition(eyePosition, v);
}