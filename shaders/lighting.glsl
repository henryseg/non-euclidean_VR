/***********************************************************************************************************************
 * @file
 * This file defines all the illumination functions
 **********************************************************************************************************************/




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

  vec3 baseColor = material.ambient * material.color;
  float coeff = material.diffuse * NdotL + material.specular * pow(RdotV, material.shininess);
  coeff = coeff * intensity;
  vec3 res = coeff * (baseColor + lightColor.rgb);
  return res;
}

/**
 * Phong lighting model.
 * Take into account all possible lights and directions
 * @param[in] v incidence vector
 * @param[in] obj the object we are rendering
 * @todo Choose a convention for the incidence vector `v`.
 * Should it point toward the object, or the observer?
 */
vec3 phongModel(RelVector v, Solid solid) {
  RelVector n = sceneNormal(v, solid);

  Light light;
  Point lightLoc;
  Vector[MAX_DIRS] dirs;
  float[MAX_DIRS] lens;
  int k;

  //vec3 color = solid.material.ambient * solid.material.color;
  vec3 color = vec3(0);

  {{#lights}}
    light = {{name}};
    lightLoc = applyIsometry(v.invCellBoost, light.item.loc);
    k = directions(v.local.pos, lightLoc, MAX_DIRS, dirs, lens);
    for(int j=0; j < k; j++){
      color = color + lightComputation(v.local, n.local, dirs[j], lens[j], solid.material, light.color);
    }
  {{/lights}}

  return color;
}
