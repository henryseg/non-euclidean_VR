// language=GLSL
export default `//
/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec4 dir = vec4(coords, 0);
    dir = camera.matrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}

RelVector mappingFromFlatScreen(vec2 coords) {
    // calculate subpixel camera jitter for anti aliasing
    vec2 jitter = vec2(randomFloat(), randomFloat()) - 0.5;

    // calculate coordinates of the ray target on the imaginary pixel plane.
    vec2 planeCoords = (coords - 0.5 * resolution + jitter) / (0.5 * resolution.y);

    //move z-distance for fov:
    float z = - 1. / tan(radians(0.5 * camera.fov));

    // -1 to +1 on x,y axis. 1 unit away on the z axis
    vec4 dir = vec4(planeCoords, z, 0);

    dir = camera.matrix * dir;
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}
`
;