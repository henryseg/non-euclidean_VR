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
 * Note that we only keep the rotation part form the modelViewMatrix
 * In this way, there is no need to update the position of the horizon spheres.
 * They always appear as attached to the camera !
 *
 * Another option would be to totally bypass the modeViewMatrix,
 * and implement the rotation inside the camera mapping.
 * It seems that this choice is less jiggly in VR.
 * However there are so many parameters invovled that this might be totally unrelated
 *
 * Added fulldome project for Burnside man
 */
void main()
{

    screenPosition = vec3((2. * uv - 1.) * windowSize / windowSize.y, 1);
    gl_Position =  vec4(position, 1);

}