/**
 * Compute the initial direction for the ray-marching
 * Native view in hyperbolic space.
 * The direction are computed in such a way that,
 * two parallel directions from the eyes converge to the same point in the boundary at infinity of H3
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec4 dir = vec4(coords, 0);
    dir = normalize(dir);
    float c = cosh(ipDist);
    float s = sinh(ipDist);
    mat4 m = c * mat4(
    c * c, 0, 0, s * c,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -s * c, 0, 0, -s * s
    );
    dir.w = 1.;
    dir = m * dir;
    dir.w = 0.;
    dir = eyeMatrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    return applyPosition(eyePosition, v);
}