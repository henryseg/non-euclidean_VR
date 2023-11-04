/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec3 dir = vec3(coords.xy, -1. / tan(0.5 * camera.fovRadians));
    Vector v = createVector(ORIGIN, dir);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}