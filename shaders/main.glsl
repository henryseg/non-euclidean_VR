/***********************************************************************************************************************
 * @file
 * Main file :
 * - Create a new direction for each vector on the "screen".
 * - Launch the raymarching
 * - If an object has been hit, call the lighting functions
 **********************************************************************************************************************/

/**
 * Position on the sphere.
 */
varying vec3 spherePosition;


/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point on the sphere
 */
RelVector rayDir(vec3 coords){
    vec3 dir = normalize(coords);
    Vector v = createVector(ORIGIN, dir);
    return applyPosition(eyePosition, v);
}



/**
 * Main function. Wrap everything together:
 * - setup all the data
 * - Compute the direction where to start the ray-marching.
 * - Ray-march in this direction.
 * - If we hit an object compute the corresponding color.
 */
void main() {
    vec3 color;
    Solid solid;

    setup();
    RelVector v = rayDir(spherePosition);
    int hit = raymarch(v, solid);

    switch (hit) {
        case -1:
        color = debugColor;
        break;
        case 0:
        color = vec3(0, 0, 0);
        break;
        default :
        color = phongModel(v, solid);
    }

    gl_FragColor = vec4(color, 1);

}
