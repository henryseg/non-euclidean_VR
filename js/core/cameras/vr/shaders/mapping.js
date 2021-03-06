// language=GLSL
export default `//
/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec4 dir = normalize(vec4(coords, 0));
    dir = camera.matrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    return applyPosition(camera.position, v);
}`;