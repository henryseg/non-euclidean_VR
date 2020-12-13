/***********************************************************************************************************************
 * @file
 * Main file :
 * - Create a new direction for each vector on the "screen".
 * - Launch the raymarching
 * - If an object has been hit, call the lighting functions
 **********************************************************************************************************************/




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
    RelVector normal;

    setup();
    RelVector v = rayDir(spherePosition);

    int hit = raymarch(v, solid, normal);

    switch (hit) {
        case HIT_DEBUG:
        color = debugColor;
        break;
        case HIT_NOTHING:
        color = vec3(0, 0, 0);
        break;
        case HIT_SOLID :
        color = phongModel(v, solid, normal);
        break;
        default :
        // there is a problem if we reached that point (hence the red color)!
        color = vec3(1, 0, 0);
    }

    gl_FragColor = vec4(color, 1);

}
