/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Vertex shader
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

uniform vec2 windowSize;
varying vec3 screenPosition;

/**
 * Main function of the vertex shader.
 * Return the screen coordinates as a vector (x,y,-1), where
 * - y ranges between -1 and 1
 * - x is scaled accordingly
 * (we follow here Three.js convention where the field of view is vertical, measured from bottom to top).
 */
void main()
{
    screenPosition = vec3((2. * uv - 1.) * windowSize / windowSize.y, 1);
    gl_Position =  vec4(position, 1);

}