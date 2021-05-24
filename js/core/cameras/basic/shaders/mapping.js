// language=GLSL
export default `//
/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    dir = camera.matrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}`;