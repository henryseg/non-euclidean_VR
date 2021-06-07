// language=GLSL
export default `//
/***********************************************************************************************************************
 * @struct
 * Checkerboard material
 **********************************************************************************************************************/
struct PathTracerWrapMaterial {
    vec3 emission;
    vec3 specular;
    vec3 absorb;
    float ior;
    float roughness;
    float diffuseChance;
    float reflectionChance;
    float refractionChance;
};


RayType setRayType(PathTracerWrapMaterial material, ExtVector v, RelVector n) {
    RayType res = RayType(false, false, false, 0.);
    float random = randomFloat();

    float reflectionChance = fresnelReflectAmount(v.vector, n, 0.8, material.reflectionChance, 1.0);
    float chanceMultiplier = (1. - reflectionChance) / (1. - material.reflectionChance);
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
`;

