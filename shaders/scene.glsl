/**
 * Distance along the geodesic directed by `v` to the closest object in the local scene
 * @param[in] v the direction to follows
 * @param[out] id `id` is zero as long as the ray has not hit an object.
 * If the ray has it an object, `id` is updated with the id of that object.
 * `id` = -1 can be used for debugging purposes.
 */
float localSceneSDF(Vector v, out int id){
  return 0.;
}


/**
 * Distance along the geodesic directed by `v` to the closest object in the global scene
 * @param[in] v the direction to follows
 * @param[out] id `id` = -1 as long as the ray has not hit an object.
 * If the ray has it an object, `id` is updated with the id of that object.
 * `id` = -2 can be used for debugging purposes.
 */
float globalSceneSDF(Vector v, out int id){
  id = -1;
  Object obj;
  float res = maxDist;
  float dist;

  dist = ballSDF(v, objPos0, .4);
  if(abs(dist) < marchingThreshold) {
    id = 0;
    return dist;
  }
  res = min(res, dist);

  dist = ballSDF(v, objPos1, .1);
  if(abs(dist) < marchingThreshold) {
    id = 1;
    return dist;
  }
  res = min(res, dist);

  return res;
}


/**
 * Compute the normal to the scene at the vector `v`
 * @param[in] v the vector when we hit the scene
 * @param[in] id the specific object that has been hit
 * @remark Since we know, which object has been hit, we don't need to use the scenceSDF to estimate the normal.
 * We can directly use the SDF of that object.
 * It is probably faster.
 */
Vector sceneNormal(Vector v, int id){
  switch(id){
    case 0:
      return ballSDFGrad(v, object0.item.pos, 0.);
    case 1:
      return ballSDFGrad(v, object1.item.pos, 0.);
  }
}
