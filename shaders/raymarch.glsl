/**
 * Teleporting.
 * Check the the underlying point is still in the fundamental domain.
 * If not, teleport the vector `v`, update `fixIsom`, and return true.
 * Otherwise, return false.
 * @param[inout] v - the current vector during the raymarching
 * @param[inout] fixIsom - the currrent status of the isometry collecting all teleportations
 * @return True if a teleportation has been performed, False otherwise
 */
bool teleport(inout Vector v, inout fixIsom){}

/**
 * Ray-marching.
 * @param[inout] v The initial vector for raymarching.
 * The vector is updated by the function,
 * that is at the end, `v` is the incidence vector at which we hit an object (if any)
 * @param[out] fixIsom isometry collecting all the teleportations done during the ray-marching
 * @return
 * - the id of the hit object (if any)
 * - 0 if no object has been hit
 * - -1 if there is a bug
 * @remark Should we start ids at 0?
 */
int raymarch(inout Vector v, out fixIsom){}