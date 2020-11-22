

/**
 * Signed distance function for the ball of radius `r` centered at `c`
 * @param[in] v the vector at which we evaluated the sdf
 * @param[in] c the center of the ball
 * @param[in] r the radius of the ball
 * @return the distance from `p` to the ball
 */
float ballSDF(Vector v, Point c, float r){
  return dist(v.pos,c) - r;
}

/**
 * Gradient of the ball sdf
 * @param[in] v the vector at which we evaluated the sdf
 * @param[in] c the center of the ball
 * @param[in] r the radius of the ball
 * @return the distance from `p` to the ball
 */
Vector ballSDFGrad(Vector v, Point c, float r){
  Vector res = Vector(v.pos, v.pos.coords - c.coords);
  return geomNormalize(res);
}
