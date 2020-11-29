varying vec3 spherePosition;

void main()
{
    spherePosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
