// language=Mustache + GLSL
export default `//
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

    RelVector vector = mapping(spherePosition);
    ExtVector v = ExtVector(vector, 0., 0., false);
    vec3 color = getColor(v);
    {{#postprocess}}
        color = postProcess(color);
    {{/postprocess}}
    gl_FragColor = vec4(color, 1);


}
`;