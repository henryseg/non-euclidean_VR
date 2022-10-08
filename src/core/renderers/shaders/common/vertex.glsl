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
 * Note that we only keep the rotation part form the modelViewMatrix
 * In this way, there is no need to update the position of the horizon spheres.
 * They always appear as attached to the camera !
 */
void main()
{
    spherePosition = position;
    // keep only the rotation part from the matrix view
    mat4 aux = modelViewMatrix;
    aux[3] = vec4(0, 0, 0, 1);
    gl_Position = projectionMatrix * aux * vec4(position, 1.0);
}