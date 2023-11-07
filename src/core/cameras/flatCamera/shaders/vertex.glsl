/***********************************************************************************************************************
 ***********************************************************************************************************************
 *
 * Vertex shader
 *
 ***********************************************************************************************************************
 **********************************************************************************************************************/

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
 */
void main()
{
    // spherePosition = position;
    // keep only the rotation part from the matrix view
    mat4 rot = modelViewMatrix;
    rot[3] = vec4(0, 0, 0, 1);

    vec4 aux = rot * vec4(position, 1.0);
    screenPosition = aux.xyz;
    gl_Position = projectionMatrix * rot * aux;
}