/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec4 dir = vec4(coords, 0);
    dir = normalize(dir);
    float c = cosh(camera.ipDist);
    float s = sinh(camera.ipDist);
    mat4 m = c * mat4(
    c * c, 0, 0, s * c,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -s * c, 0, 0, -s * s
    );
    dir.w = 1.;
    dir = m * dir;
    dir.w = 0.;
    dir = camera.matrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    return applyPosition(camera.position, v);
}