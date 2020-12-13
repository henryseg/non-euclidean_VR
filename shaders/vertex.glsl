varying vec3 spherePosition;

void main()
{
    spherePosition = position;
    gl_Position = projectionMatrix * vec4(position, 1.0);
}
