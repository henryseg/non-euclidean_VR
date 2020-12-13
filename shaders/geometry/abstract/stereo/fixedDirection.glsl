/**
 * Compute the initial direction for the ray-marching
 * Don't update the direction with the camera (debuging purpose only)
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec3 dir = normalize(coords);
    Vector v = createVector(ORIGIN, dir);
    return applyPosition(eyePosition, v);
}