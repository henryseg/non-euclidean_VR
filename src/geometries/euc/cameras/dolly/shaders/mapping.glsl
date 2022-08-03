/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector mapping(vec3 coords){
    // we compute all the data, in the local frame of the camera
    // and they apply the camera position
    // height of the screen
    float aux = 1. - camera.center / camera.focus;
    float h = camera.radius / (camera.ratio * aux);
    float t = tan(0.5 * camera.fov);
    // point on the screen
    vec2 xy = h * coords.xy / (coords.z * t);
    vec4 m = vec4(xy, 0., 1.);
    // direction
    float eps = sign(camera.focus);
    vec4 u = eps * vec4(xy, -camera.focus, 0.);

    // apply the camera world matrix (a priori not needed here, this is for VR)
    m = camera.matrix * m;
    u = camera.matrix * u;
    // apply th camera boosts.
    Vector v = createVector(Point(m), u.xyz);
    RelVector res = applyPosition(camera.position, v);
    return geomNormalize(res);
}