/**
 * Teleporting.
 * Check the the underlying point is still in the fundamental domain.
 * If not, teleport the vector `v`, update `fixIsom`, and return true.
 * Otherwise, return false.
 * @param[inout] v - the current vector during the raymarching
 * @param[inout] fixIsom - the current status of the isometry collecting all teleportations
 * @return True if a teleportation has been performed, False otherwise
 */
bool teleport(inout Vector v, inout Isometry fixIsom){
  return false;
}

/**
 * Ray-marching.
 * @param[inout] v The initial vector for raymarching.
 * The vector is updated by the function,
 * that is at the end, `v` is the incidence vector at which we hit an object (if any)
 * @param[out] fixIsom isometry collecting all the teleportations done during the ray-marching
 * @return
 * - the id of the hit object (if any)
 * - -1 if no object has been hit
 * - -2 if there is a bug
 * @remark Should we start ids at 0?
 * @remark Raymarch, starting each new step from the origin (goal : reduce accumulative errors)
 */
int raymarch(inout Vector v, out Isometry fixIsom){
  Vector vaux = v;
  float depth = minDist;
  float dist;
  int id;

  for(int i=0; i < maxMarchingSteps; i++){
    dist = globalSceneSDF(vaux, id);
    if(id > -1) {
      // we hit an object
      break;
    }
    depth = depth + dist;
    if(depth > maxDist){
      // we reached the maximal distance
      break;
    }
    vaux = flow(v, depth);
  }
  v = vaux;
  return id;
}
