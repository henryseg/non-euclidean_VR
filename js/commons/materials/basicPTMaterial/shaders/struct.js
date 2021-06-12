// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct BasicPTMaterial {
    vec3 emission;
    vec3 volumeEmission;
    vec3 diffuse;
    vec3 specular;
    vec3 absorb;
    float ior;
    float roughness;
    float diffuseChance;
    float reflectionChance;
    float refractionChance;
};


RayType setRayType(BasicPTMaterial material, ExtVector v, RelVector n, float r) {
    RayType res = RayType(false, false, false, 0.);
    float random = randomFloat();

    float reflectionChance = fresnelReflectAmount(v.vector, n, r, material.reflectionChance, 1.0);
    float chanceMultiplier = (1. - reflectionChance) / (1. - material.reflectionChance);
   // float reflectionChance = material.reflectionChance;
    //float chanceMultiplier = 1.;
    float refractionChance = chanceMultiplier * material.refractionChance;
    float diffuseChance = 1. - refractionChance - reflectionChance;

    if (random < diffuseChance){
        res.diffuse = true;
        res.chance = diffuseChance;
    } else if (random < diffuseChance + reflectionChance){
        res.reflect = true;
        res.chance = reflectionChance;
    }
    else {
        res.refract = true;
        res.chance = refractionChance;
    }
    return res;
}

vec3 render(BasicPTMaterial material, ExtVector v, RayType rayType) {
    if (rayType.reflect){
        return material.specular;
    }
//    else if(rayType.refract){
//        //does this color get used anywhere?
//        //if so here's a spot to do it.
//    }
    return material.diffuse;
}
`;

