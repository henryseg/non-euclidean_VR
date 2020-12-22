// language=GLSL
export default `//
/***********************************************************************************************************************
 * Phong Material
 **********************************************************************************************************************/

struct PhongMaterial {
    vec3 color;
    float ambient;
    float diffuse;
    float specular;
    float shininess;
};

/**
 * Compute the contribution of one direction to the illumination
 * @param[in] v incidence vector
 * @param[in] n normal vector to the object (pointing outside the solid)
 * @param[in] dir the direction from on the object to a light
 * @param[in] material material of the object
 * @param[in] lightColor the color of the light
 * @param[in] intensity the intensity of the light when it hits the solid
 * @return the contribution the this direction to the illumination.
 * @todo Choose a convention for the incidence vector \`v\`.
 * Should it point toward the object, or the observer?
 */
vec3 lightComputation(Vector v, Vector n, Vector dir, PhongMaterial material, vec3 lightColor, float intensity){
    Vector auxV = negate(v);
    Vector auxL = dir;
    Vector auxN = n;
    Vector auxR = geomReflect(negate(auxL),auxN);
    float NdotL = max(geomDot(auxN, auxL), 0.);
    float RdotV = max(geomDot(auxR, auxV), 0.);

    vec3 baseColor = material.ambient * material.color;
    float coeff = material.diffuse * NdotL + material.specular * pow(RdotV, material.shininess);
    coeff = coeff * intensity;
    vec3 res = coeff * (baseColor + lightColor.rgb);
    return res;
}`;