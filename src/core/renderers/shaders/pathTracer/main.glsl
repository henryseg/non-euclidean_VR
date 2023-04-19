/**
 * Position on the sphere.
 */
varying vec3 spherePosition;


/**
 * Main function. Wrap everything together:
 * - setup all the data
 * - Compute the direction where to start the ray-marching.
 * - Ray-march in this direction.
 * - If we hit an object compute the corresponding color.
 */
void main() {
    initSeed(gl_FragCoord.xy, frameSeed);
    RelVector vector = mappingFromFlatScreen(gl_FragCoord.xy);
    ExtVector v = ExtVector(vector, initVectorData());
    gl_FragColor = getColor(v);
}
