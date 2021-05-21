// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Phong Wrap Material
 **********************************************************************************************************************/

struct PhongWrapMaterial {
    float ambient;
    float diffuse;
    float specular;
    float shininess;
    vec3 reflectivity;
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
//vec3 lightComputation(Vector v, Vector n, Vector dir, vec3 baseColor, PhongWrapMaterial material, vec3 lightColor, float intensity){
//    Vector auxV = negate(v);
//    Vector auxL = dir;
//    Vector auxN = n;
//    Vector auxR = geomReflect(negate(auxL),auxN);
//    float NdotL = max(geomDot(auxN, auxL), 0.);
//    float RdotV = max(geomDot(auxR, auxV), 0.);
//
//    float coeff = material.diffuse * NdotL + material.specular * pow(RdotV, material.shininess);
//    coeff = coeff * intensity;
//    vec3 res = coeff * (material.ambient * baseColor + lightColor.rgb);
//    return res;
//}

vec3 lightComputation(Vector v, Vector n, Vector dir, vec3 baseColor, PhongWrapMaterial material, vec3 lightColor, float intensity){
    Vector auxV = negate(v);
    Vector auxL = dir;
    Vector auxN = n;
    Vector auxR = geomReflect(negate(auxL), auxN);
    float NdotL = max(geomDot(auxN, auxL), 0.);
    float RdotV = max(geomDot(auxR, auxV), 0.);

    //specular, diffusive and ambient intensities
    float specularCoeff = material.specular * pow(RdotV, material.shininess);
    float diffuseCoeff = material.diffuse * NdotL;
    float ambientCoeff = material.ambient;

    //specular, diffuse and ambient light colors
    //(in many versions of phong model, light sources come themselves with three sets of color properties: ambient, diffuse and specular which can be different...I so far just have made them all from the same original light color)
    vec3 specularLight = lightColor.rgb;
    vec3 diffuseLight = 0.8 * lightColor.rgb + 0.2 * vec3(1.);
    vec3 ambientLight = 0.5 * lightColor.rgb + 0.5 * vec3(1.);

    //specular, diffuse and ambient contributions
    vec3 specular = specularCoeff * specularLight;
    vec3 diffuse = diffuseCoeff * diffuseLight * baseColor;
    vec3 ambient = ambientCoeff * ambientLight * baseColor;

    //total color
    vec3 res = intensity * (ambient + diffuse + specular);

    return res;
}

`;