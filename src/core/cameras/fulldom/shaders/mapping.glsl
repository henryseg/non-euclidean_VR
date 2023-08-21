/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec2 scaledCoords = 0.5 * PI * coords.xy;
    float radius = length(scaledCoords);
    vec3 dir = vec3((sin(radius) / radius) * scaledCoords, -cos(radius));

    Vector v = createVector(ORIGIN, dir);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}