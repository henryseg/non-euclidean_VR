/**
 * Distance along the geodesic directed by `v` to the closest object in the local scene
 * @param[in] v the direction to follows
 * @param[out] id `id` is zero as long as the ray has not hit an object.
 * If the ray has it an object, `id` is updated with the id of that object.
 * `id` = -1 can be used for debugging purposes.
 */
float localSceneSDF(Vector v, out int id){}


/**
 * Distance along the geodesic directed by `v` to the closest object in the global scene
 * @param[in] v the direction to follows
 * @param[out] id `id` is zero as long as the ray has not hit an object.
 * If the ray has it an object, `id` is updated with the id of that object.
 * `id` = -1 can be used for debugging purposes.
 */
float globalSceneSDF(Vector v, out int id){}
