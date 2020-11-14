
/**
 * Intensity of the light after travelling a length `len` in the direction `dir`
 * @param[in] dir unit vector at the light position
 * @param[in] len distance from the light
 * @return intensity of the light
 */
float lightIntensity(Vector dir, float len){
  return 0.;
}

/**
 * Compute the contribution of one direction to the illumination
 * @param[in] v incidence vector
 * @param[in] n normal vector to the object (pointing outside the object)
 * @param[in] dir the direction from on the object to a light
 * @param[in] len the length of the geodesic from `p` directed by `v` to the light
 * @param[in] material material of the object
 * @param[in] lightColor the color of the light
 * @return the contribution the this direction to the illumination.

 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 lightComputation(Vector v, Vector n, Vector dir, float len, Material material, vec4 lightColor){
  return vec3(0);
}

/**
 * Phong lighting model.
 * Take into account all possible lights and directions
 * @param[in] v incidence vector
 * @param[in] id id of the of hit object
 * @param[in] material the material of the object
 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 phongModel(Vector v, int id) {
  //Vector n = sceneNormal(v,id);
  return vec3(1,0,0);
}
