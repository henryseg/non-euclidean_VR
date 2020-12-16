/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec4 dir = normalize(vec4(coords, 0));
    dir = camera * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    return applyPosition(eyePosition, v);
}