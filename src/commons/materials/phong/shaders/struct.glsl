/***********************************************************************************************************************
 * Phong Material
 **********************************************************************************************************************/

struct PhongMaterial {
    vec3 color;
    float ambient;
    float diffuse;
    float specular;
    float shininess;
    vec3 reflectivity;
};


vec3 lightComputation(Vector v, Vector n, Vector dir, PhongMaterial material, vec3 lightColor, float intensity){
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
    vec3 diffuse = diffuseCoeff * diffuseLight * material.color;
    vec3 ambient = ambientCoeff * ambientLight * material.color;

    //total color
    vec3 res = intensity * (ambient + diffuse + specular);

    return res;
}