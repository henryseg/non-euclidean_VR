/**
 * Computed color for this pixel
 */

/**
 * Compute the initial direction for the ray-marching
 * @param[in] coords the coordinates of the point (in pixels)
 */
Vector rayDir(vec2 coords){
  // Change of coordinates:
  // The origin is at the center of the screen.
  // The x-coordinates runs between -0.5 and 0.5 (the screen has width 1).
  // The y-coordinates is updated accordingly, respecting ratio.
  vec2 xy = (coords - 0.5 * resolution)/ resolution.x;
  // Depth is a function of the field of view.
  float z = -0.5 / tan(0.5 * fov);

  // Building the corresponding vector in the tangent space at the origin.
  vec3 dir = vec3(xy,z);
  Vector res = createVector(ORIGIN, dir);
  res = geomNormalize(res);

  // Translating the vector according to the boost and facing.
  res = applyPosition(position, res);
  return res;
}

/**
 * Main function. Wrap everything together:
 * - Compute the direction where to start the ray-marching.
 * - Ray-march in this direction.
 * - If we hit an object compute the corresponding color.
 */
void main() {
  vec3 color;
  Isometry fixIsom;

  setup();
  Vector v = rayDir(gl_FragCoord.xy);
  Solid solid;

  int hit = raymarch(v, fixIsom, solid);

  switch (hit) {
    case -1:
    color = debugColor;
    break;
    case 0:
    color = vec3(0.2, 0.2, 0.2);
    break;
    default :
    color = phongModel(v, solid);
  }

  gl_FragColor = vec4(color,1);

}
