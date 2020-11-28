
/**
 * Intensity of the light after travelling a length `len` in the direction `dir`
 * @param[in] dir unit vector at the light position
 * @param[in] len distance from the light
 * @return intensity of the light
 */
float lightIntensity(Vector dir, float len){
  return 1./(len * len);
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
vec3 lightComputation(Vector v, Vector n, Vector dir, float len, Material material, vec3 lightColor){
  Vector auxV = negate(v);
  Vector auxL = dir;
  Vector auxN = n;
  Vector auxR = geomReflect(negate(auxL),auxN);
  float NdotL = max(geomDot(auxN, auxL), 0.);
  float RdotV = max(geomDot(auxR, auxV), 0.);
  float intensity = lightIntensity(dir,len);

  float coeff = material.diffuse * NdotL + material.specular * pow(RdotV, material.shininess);
  coeff = coeff * intensity;
  vec3 res = coeff * lightColor.rgb;
  return res;
}

/**
 * Phong lighting model.
 * Take into account all possible lights and directions
 * @param[in] v incidence vector
 * @param[in] obj the object we are rendering
 * @param[in] material the material of the object
 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 phongModel(GenVector v, Solid solid) {
  GenVector n = sceneNormal(v, solid);

  Light light;
  Point lightLoc;
  Vector[MAX_DIRS] dirs;
  float[MAX_DIRS] lens;
  int k;

  vec3 color = solid.material.ambient * solid.material.color;


  {{#lights}}
    light = {{name}};
    lightLoc = applyIsometry(v.invCellBoost, light.item.loc);
    k = directions(v.vec.pos, lightLoc, MAX_DIRS, dirs, lens);
    for(int j=0; j < k; j++){
      color = color + lightComputation(v.vec, n.vec, dirs[j], lens[j], solid.material, light.color);
    }
  {{/lights}}

  return color;
}
