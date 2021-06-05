// language=GLSL
export default `//
/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Vertex shader
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/
 
varying vec3 spherePosition;

/**
 * Main function of the vertex shader.
 * Note that we don't use the modelViewMatrix here.
 * In this way, there is no need to update the horizon spheres.
 * They always appear as attached to the camera !
 */
void main()
{
    spherePosition = position;
    gl_Position = projectionMatrix * vec4(position, 1.0);
}
`;