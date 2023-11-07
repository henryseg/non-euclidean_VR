/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    vec4 dir = normalize(vec4(coords, 0));
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    return applyPosition(camera.position, v);
}

// Alternative option

/*
RelVector mapping(vec3 coords){
    vec4 dir = vec4(coords, 0);
    dir = normalize(dir);
    Vector v = createVector(ORIGIN, dir.xyz);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}
*/